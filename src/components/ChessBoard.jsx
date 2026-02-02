import { useState, useEffect, useRef } from 'react'
import './ChessBoard.css'
import { isValidMove, makeMove, isKingInCheck, isCheckmate, isStalemate } from '../utils/chessRules'
import { boardToFen, uciToMove } from '../utils/fenConverter'

// Import all piece images
import BlackRook from '../assets/Black-Rook.png'
import BlackKnight from '../assets/Black-Knight.png'
import BlackBishop from '../assets/Black-Bishop.png'
import BlackQueen from '../assets/Black-Queen.png'
import BlackKing from '../assets/Black-King.png'
import BlackPawn from '../assets/Black-Pawn.png'
import WhiteRook from '../assets/White-Rook.png'
import WhiteKnight from '../assets/White-Knight.png'
import WhiteBishop from '../assets/White-Bishop.png'
import WhiteQueen from '../assets/White-Queen.png'
import WhiteKing from '../assets/White-King.png'
import WhitePawn from '../assets/White-Pawn.png'

const pieceImages = {
  'Black-Rook': BlackRook,
  'Black-Knight': BlackKnight,
  'Black-Bishop': BlackBishop,
  'Black-Queen': BlackQueen,
  'Black-King': BlackKing,
  'Black-Pawn': BlackPawn,
  'White-Rook': WhiteRook,
  'White-Knight': WhiteKnight,
  'White-Bishop': WhiteBishop,
  'White-Queen': WhiteQueen,
  'White-King': WhiteKing,
  'White-Pawn': WhitePawn,
};

const ChessBoard = ({ gameState, onMove, onGameStateChange }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [stockfishWorker, setStockfishWorker] = useState(null);
  const [stockfishReady, setStockfishReady] = useState(false);
  const [analysisWorker, setAnalysisWorker] = useState(null);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [animatingMove, setAnimatingMove] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState(0);
  const gameStateRef = useRef(gameState);
  const expectedMoveIdRef = useRef(0); // Track expected move ID to prevent stale moves

  // Keep the ref updated with the latest gameState
  useEffect(() => {
    gameStateRef.current = gameState;
    // Increment move ID when state changes to invalidate pending computer moves
    expectedMoveIdRef.current++;
    // Sync evaluation with game state (important for takeback/forward)
    if (gameState.evaluation !== undefined) {
      setCurrentEvaluation(gameState.evaluation);
    }
  }, [gameState]);

  // Initialize analysis worker for evaluation (all game modes)
  useEffect(() => {
    console.log('🔍 Initializing analysis worker...');
    const worker = new Worker('/stockfish.js');
    
    worker.addEventListener('message', function(e) {
      // Log all messages for debugging
      if (e.data.includes('uciok')) {
        console.log('✅ Analysis worker: UCI OK');
        setAnalysisReady(true);
        worker.postMessage('isready');
      } else if (e.data.includes('readyok')) {
        console.log('✅ Analysis worker: Ready OK');
      } else if (e.data.startsWith('info') && e.data.includes('score')) {
        // Parse evaluation from Stockfish info lines
        const cpMatch = e.data.match(/score cp (-?\d+)/);
        const mateMatch = e.data.match(/score mate (-?\d+)/);
        
        const currentGameState = gameStateRef.current;
        const isBlackToMove = currentGameState.currentPlayer === 'Black';
        
        if (mateMatch) {
          const mateIn = parseInt(mateMatch[1]);
          let evalScore = mateIn > 0 ? 10000 : -10000;
          // Flip sign if black to move (Stockfish gives eval from side to move perspective)
          if (isBlackToMove) evalScore = -evalScore;
          console.log('📊 Evaluation (Mate):', mateIn > 0 ? `+M${Math.abs(mateIn)}` : `-M${Math.abs(mateIn)}`, '=', evalScore, isBlackToMove ? '(flipped for Black)' : '');
          setCurrentEvaluation(evalScore);
        } else if (cpMatch) {
          let evalScore = parseInt(cpMatch[1]);
          // Flip sign if black to move (Stockfish gives eval from side to move perspective)
          if (isBlackToMove) evalScore = -evalScore;
          console.log('📊 Evaluation:', evalScore, 'cp =', (evalScore / 100).toFixed(2), isBlackToMove ? '(flipped for Black)' : '');
          setCurrentEvaluation(evalScore);
        }
      }
    });
    
    setAnalysisWorker(worker);
    worker.postMessage('uci');

    return () => {
      console.log('🛑 Terminating analysis worker');
      worker.terminate();
      setAnalysisReady(false);
    };
  }, [gameState.gameId]);

  // Request evaluation after each move or position change
  useEffect(() => {
    if (analysisWorker && analysisReady && gameState.board) {
      const fen = boardToFen(gameState.board, gameState.currentPlayer, gameState);
      console.log('🔍 Requesting analysis for:', fen);
      console.log('📋 Current player:', gameState.currentPlayer);
      console.log('🎯 Current evaluation state:', currentEvaluation);
      // Stop any ongoing analysis
      analysisWorker.postMessage('stop');
      // Start new analysis
      analysisWorker.postMessage('position fen ' + fen);
      analysisWorker.postMessage('go depth 15');
    }
  }, [gameState.board, gameState.currentPlayer, gameState.currentStateIndex, analysisWorker, analysisReady]);

  // Initialize Stockfish when in computer mode
  useEffect(() => {
    if (gameState.gameMode === 'computer') {
      console.log('Initializing Stockfish for game:', gameState.gameId);
      // Use the JavaScript version (more reliable than WASM)
      const worker = new Worker('/stockfish.js');
      
      worker.addEventListener('message', function(e) {
        console.log('Stockfish:', e.data);
        
        if (e.data.includes('uciok')) {
          setStockfishReady(true);
          worker.postMessage('isready');
        } else if (e.data.startsWith('info') && e.data.includes('score')) {
          // Parse evaluation from Stockfish info lines
          const cpMatch = e.data.match(/score cp (-?\d+)/);
          const mateMatch = e.data.match(/score mate (-?\d+)/);
          
          if (mateMatch) {
            // Mate score: convert to large centipawn value
            const mateIn = parseInt(mateMatch[1]);
            const evalScore = mateIn > 0 ? 10000 : -10000;
            setCurrentEvaluation(evalScore);
          } else if (cpMatch) {
            // Centipawn score
            const evalScore = parseInt(cpMatch[1]);
            setCurrentEvaluation(evalScore);
          }
        } else if (e.data.startsWith('bestmove')) {
          const match = e.data.match(/bestmove ([a-h][1-8][a-h][1-8])/);
          if (match) {
            const uciMove = match[1];
            const moveId = this.moveId; // Capture the move ID when request was made
            console.log('Best move:', uciMove, 'Move ID:', moveId);
            const move = uciToMove(uciMove);
            console.log('Converted move:', move);
            const currentGameState = gameStateRef.current;
            console.log('Current board:', currentGameState.board);
            
            // Only execute if this is still the expected move (no takeback happened)
            if (moveId === expectedMoveIdRef.current && move && currentGameState.board) {
              const piece = currentGameState.board[move.from.row]?.[move.from.col];
              console.log('Piece at from position:', piece);
              setIsThinking(false);
              // Add a small delay so the move is visible
              setTimeout(() => {
                executeMove(move.from, move.to, move.promotion);
              }, 200);
            } else {
              console.log('Ignoring stale move - moveId mismatch:', moveId, 'vs', expectedMoveIdRef.current);
              setIsThinking(false);
            }
          }
        }
      });
      
      setStockfishWorker(worker);
      
      // Initialize UCI protocol
      worker.postMessage('uci');

      return () => {
        console.log('Cleaning up Stockfish worker');
        worker.terminate();
        setStockfishReady(false);
        setIsThinking(false);
      };
    } else {
      // Reset when switching away from computer mode
      setStockfishWorker(null);
      setStockfishReady(false);
      setIsThinking(false);
    }
  }, [gameState.gameMode, gameState.gameId]);

  // Make computer move if it's computer's turn
  useEffect(() => {
    if (gameState.gameMode === 'computer' && 
        gameState.currentPlayer !== gameState.playerColor &&
        (gameState.gameStatus === 'active' || gameState.gameStatus === 'check') &&
        gameState.board &&
        stockfishWorker &&
        stockfishReady) {
      // Add a small delay to ensure state has settled
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.currentStateIndex, stockfishWorker, stockfishReady]);

  const makeComputerMove = async () => {
    if (!stockfishWorker || !stockfishReady || isThinking) {
      console.log('Stockfish not ready or already thinking');
      return;
    }

    const currentGameState = gameStateRef.current;
    const fen = boardToFen(currentGameState.board, currentGameState.currentPlayer, currentGameState);
    console.log('Requesting move for FEN:', fen);
    
    setIsThinking(true);
    // Attach current moveId to the worker so the callback can check it
    stockfishWorker.moveId = expectedMoveIdRef.current;
    // Send position and go command to Stockfish
    stockfishWorker.postMessage('position fen ' + fen);
    stockfishWorker.postMessage('go depth 15');
  };

  const executeMove = (from, to, promotion) => {
    const currentGameState = gameStateRef.current;
    const board = currentGameState.board;
    console.log('executeMove called with:', { from, to, promotion });
    console.log('Current board state:', board);
    
    if (!board || !board[from.row] || !board[from.row][from.col]) {
      console.error('Invalid board state or piece position');
      console.error('Board exists:', !!board);
      console.error('Row exists:', board ? !!board[from.row] : false);
      console.error('Piece exists:', board && board[from.row] ? !!board[from.row][from.col] : false);
      console.error('From position:', from);
      return;
    }
    
    const newBoard = makeMove(board, from, to);
    const movingPiece = board[from.row][from.col];
    const capturedPiece = board[to.row][to.col];
    
    // Track captured pieces - deep copy to avoid mutation
    const newCapturedPieces = {
      White: [...(currentGameState.capturedPieces?.White || [])],
      Black: [...(currentGameState.capturedPieces?.Black || [])]
    };
    if (capturedPiece) {
      newCapturedPieces[movingPiece.color].push(capturedPiece.piece);
    }
    
    // Handle pawn promotion
    if (movingPiece.piece === 'Pawn' && (to.row === 0 || to.row === 7)) {
      const promoPiece = promotion ? promotion.toUpperCase() : 'Q';
      const promoPieceMap = { 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight' };
      newBoard[to.row][to.col] = {
        piece: promoPieceMap[promoPiece] || 'Queen',
        color: movingPiece.color,
        image: pieceImages[`${movingPiece.color}-${promoPieceMap[promoPiece] || 'Queen'}`]
      };
    }

    // Handle castling
    if (movingPiece.piece === 'King' && Math.abs(to.col - from.col) === 2) {
      const isKingside = to.col > from.col;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? 5 : 3;
      const { row } = from;
      newBoard[row][rookToCol] = newBoard[row][rookFromCol];
      newBoard[row][rookFromCol] = null;
    }

    // Handle en passant
    if (movingPiece.piece === 'Pawn' && 
        currentGameState.enPassantTarget &&
        to.row === currentGameState.enPassantTarget.row &&
        to.col === currentGameState.enPassantTarget.col) {
      const capturedPawnRow = movingPiece.color === 'White' ? to.row + 1 : to.row - 1;
      newBoard[capturedPawnRow][to.col] = null;
      // Track en passant capture
      newCapturedPieces[movingPiece.color].push('Pawn');
    }

    // Update en passant target
    let newEnPassantTarget = null;
    if (movingPiece.piece === 'Pawn' && Math.abs(to.row - from.row) === 2) {
      const targetRow = movingPiece.color === 'White' ? from.row - 1 : from.row + 1;
      newEnPassantTarget = { row: targetRow, col: from.col };
    }

    // Update has moved flags
    const newHasMoved = { ...currentGameState.hasMoved };
    if (movingPiece.piece === 'King') {
      newHasMoved[movingPiece.color].king = true;
    }
    if (movingPiece.piece === 'Rook') {
      if (from.col === 0) newHasMoved[movingPiece.color].rookQueenside = true;
      else if (from.col === 7) newHasMoved[movingPiece.color].rookKingside = true;
    }

    const nextPlayer = currentGameState.currentPlayer === 'White' ? 'Black' : 'White';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const pieceSymbol = movingPiece.piece === 'Pawn' ? '' : movingPiece.piece[0];
    const capture = board[to.row][to.col] ? 'x' : '';
    const toSquare = files[to.col] + ranks[to.row];
    const moveNotation = pieceSymbol + capture + toSquare;

    let newStatus = 'active';
    if (isKingInCheck(newBoard, nextPlayer)) {
      if (isCheckmate(newBoard, nextPlayer, { ...currentGameState, hasMoved: newHasMoved, enPassantTarget: newEnPassantTarget })) {
        newStatus = 'checkmate';
      } else {
        newStatus = 'check';
      }
    } else if (isStalemate(newBoard, nextPlayer, { ...currentGameState, hasMoved: newHasMoved, enPassantTarget: newEnPassantTarget })) {
      newStatus = 'stalemate';
    }

    // Set last move for highlighting
    setLastMove({ from, to });

    const newState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      gameStatus: newStatus,
      enPassantTarget: newEnPassantTarget,
      hasMoved: newHasMoved,
      moveHistory: [...currentGameState.moveHistory, moveNotation],
      capturedPieces: newCapturedPieces,
      evaluation: currentEvaluation
    };

    // Save full state to history (truncate any forward history if we're not at the end)
    const newHistory = currentGameState.stateHistory.slice(0, currentGameState.currentStateIndex + 2);
    newHistory.push(newState);

    onGameStateChange({
      ...currentGameState,
      ...newState,
      stateHistory: newHistory,
      currentStateIndex: newHistory.length - 1
    });
  };
  // Initial chess board setup
  const getInitialBoard = () => [
    // Rank 8 (Black major pieces)
    [
      { piece: 'Rook', color: 'Black', image: BlackRook },
      { piece: 'Knight', color: 'Black', image: BlackKnight },
      { piece: 'Bishop', color: 'Black', image: BlackBishop },
      { piece: 'Queen', color: 'Black', image: BlackQueen },
      { piece: 'King', color: 'Black', image: BlackKing },
      { piece: 'Bishop', color: 'Black', image: BlackBishop },
      { piece: 'Knight', color: 'Black', image: BlackKnight },
      { piece: 'Rook', color: 'Black', image: BlackRook },
    ],
    // Rank 7 (Black pawns)
    Array(8).fill(null).map(() => ({ piece: 'Pawn', color: 'Black', image: BlackPawn })),
    // Rank 6-3 (Empty squares)
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    // Rank 2 (White pawns)
    Array(8).fill(null).map(() => ({ piece: 'Pawn', color: 'White', image: WhitePawn })),
    // Rank 1 (White major pieces)
    [
      { piece: 'Rook', color: 'White', image: WhiteRook },
      { piece: 'Knight', color: 'White', image: WhiteKnight },
      { piece: 'Bishop', color: 'White', image: WhiteBishop },
      { piece: 'Queen', color: 'White', image: WhiteQueen },
      { piece: 'King', color: 'White', image: WhiteKing },
      { piece: 'Bishop', color: 'White', image: WhiteBishop },
      { piece: 'Knight', color: 'White', image: WhiteKnight },
      { piece: 'Rook', color: 'White', image: WhiteRook },
    ],
  ];

  // Determine if a square is light or dark
  const isLightSquare = (row, col) => (row + col) % 2 !== 0

  useEffect(() => {
    if (!gameState.board) {
      onGameStateChange({ ...gameState, board: getInitialBoard() });
    }
  }, [gameState.board]);

  const handleSquareClick = (row, col) => {
    // Don't allow moves if it's computer's turn
    if (gameState.gameMode === 'computer' && gameState.currentPlayer !== gameState.playerColor) {
      return;
    }

    const board = gameState.board || getInitialBoard();
    const clickedPiece = board[row][col];

    // If game is over, don't allow moves
    if (gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate') {
      return;
    }

    // If no piece is selected
    if (!selectedSquare) {
      // Select piece if it belongs to current player
      if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
        setSelectedSquare({ row, col });
        // Calculate valid moves for this piece
        const moves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (isValidMove(board, { row, col }, { row: r, col: c }, gameState.currentPlayer, gameState)) {
              moves.push({ row: r, col: c });
            }
          }
        }
        setValidMoves(moves);
      }
    } else {
      // Try to move the selected piece
      const from = selectedSquare;
      const to = { row, col };

      // If clicking the same square, deselect
      if (from.row === to.row && from.col === to.col) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // If clicking another piece of the same color, select it instead
      if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
        setSelectedSquare({ row, col });
        const moves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (isValidMove(board, { row, col }, { row: r, col: c }, gameState.currentPlayer, gameState)) {
              moves.push({ row: r, col: c });
            }
          }
        }
        setValidMoves(moves);
        return;
      }

      // Try to make the move
      if (isValidMove(board, from, to, gameState.currentPlayer, gameState)) {
        executeMove(from, to);
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // Invalid move, deselect
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const isValidMoveSquare = (row, col) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const board = gameState.board || getInitialBoard();
  
  // Flip board arrays if playing as black
  const displayBoard = gameState.isFlipped ? [...board].reverse() : board;
  const files = gameState.isFlipped 
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = gameState.isFlipped
    ? ['1', '2', '3', '4', '5', '6', '7', '8']
    : ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const getActualPosition = (displayRow, displayCol) => {
    if (gameState.isFlipped) {
      return {
        row: 7 - displayRow,
        col: 7 - displayCol
      };
    }
    return { row: displayRow, col: displayCol };
  };

  // Calculate win percentage from centipawn evaluation
  const getWinPercentage = (cpScore) => {
    // Convert centipawns to win percentage using formula
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cpScore)) - 1);
  };

  const whiteWinPercentage = getWinPercentage(currentEvaluation);
  const blackWinPercentage = 100 - whiteWinPercentage;
  const evalDisplay = Math.abs(currentEvaluation) > 1000 
    ? (currentEvaluation > 0 ? `+M${Math.ceil(currentEvaluation / 1000)}` : `-M${Math.ceil(Math.abs(currentEvaluation) / 1000)}`)
    : (currentEvaluation / 100).toFixed(1);
  
  // Debug log
  console.log('📊 Bar render - Eval:', currentEvaluation, 'White%:', whiteWinPercentage.toFixed(1), 'Black%:', blackWinPercentage.toFixed(1));

  return (
    <div className="chess-container">
      {/* Evaluation Bar */}
      <div className="evaluation-bar-container">
        <div className="evaluation-bar">
          <div 
            className="eval-white" 
            style={{ height: `${whiteWinPercentage}%` }}
          >
            {whiteWinPercentage > 20 && parseFloat(evalDisplay) > 0 && (
              <span className="eval-text">{evalDisplay}</span>
            )}
          </div>
          <div 
            className="eval-black"
            style={{ height: `${blackWinPercentage}%` }}
          >
            {blackWinPercentage > 20 && parseFloat(evalDisplay) < 0 && (
              <span className="eval-text">{Math.abs(parseFloat(evalDisplay)).toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="board-wrapper">
        {/* Top file labels */}
        <div className="file-labels top">
          <div className="corner"></div>
          {files.map((file) => (
            <div key={file} className="file-label">
              {file}
            </div>
          ))}
          <div className="corner"></div>
        </div>

        <div className="board-with-ranks">
          {/* Left rank labels */}
          <div className="rank-labels left">
            {ranks.map((rank) => (
              <div key={rank} className="rank-label">
                {rank}
              </div>
            ))}
          </div>

          {/* Chess board */}
          <div className="chess-board">
            {displayBoard.map((row, displayRow) => {
              const actualRow = gameState.isFlipped ? 7 - displayRow : displayRow;
              const displayRowCells = gameState.isFlipped ? [...row].reverse() : row;
              
              return (
              <div key={displayRow} className="board-row">
                {displayRowCells.map((square, displayCol) => {
                  const actualCol = gameState.isFlipped ? 7 - displayCol : displayCol;
                  const actualPos = { row: actualRow, col: actualCol };
                  const isLastMoveFrom = lastMove && lastMove.from.row === actualRow && lastMove.from.col === actualCol;
                  const isLastMoveTo = lastMove && lastMove.to.row === actualRow && lastMove.to.col === actualCol;
                  const isKingInCheckSquare = square && square.piece === 'King' && 
                    gameState.gameStatus === 'check' && square.color === gameState.currentPlayer;
                  const isKingCheckmated = square && square.piece === 'King' && 
                    gameState.gameStatus === 'checkmate' && square.color === gameState.currentPlayer;
                  
                  return (
                  <div
                    key={`${displayRow}-${displayCol}`}
                    className={`square ${
                      isLightSquare(actualRow, actualCol) ? 'light' : 'dark'
                    } ${
                      selectedSquare?.row === actualRow && selectedSquare?.col === actualCol
                        ? 'selected'
                        : ''
                    } ${
                      isValidMoveSquare(actualRow, actualCol) ? 'valid-move' : ''
                    } ${
                      isLastMoveFrom || isLastMoveTo ? 'last-move' : ''
                    } ${
                      isKingInCheckSquare ? 'king-in-check' : ''
                    } ${
                      isKingCheckmated ? 'king-checkmated' : ''
                    }`}
                    onClick={() => handleSquareClick(actualRow, actualCol)}
                  >
                    {square && (
                      <img
                        src={square.image}
                        alt={`${square.color} ${square.piece}`}
                        className="piece"
                      />
                    )}
                    {isValidMoveSquare(actualRow, actualCol) && (
                      <div className={`move-indicator ${square ? 'capture' : ''}`} />
                    )}
                  </div>
                );
              })}
              </div>
            );
          })}
          </div>

          {/* Right rank labels */}
          <div className="rank-labels right">
            {ranks.map((rank) => (
              <div key={rank} className="rank-label">
                {rank}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom file labels */}
        <div className="file-labels bottom">
          <div className="corner"></div>
          {files.map((file) => (
            <div key={file} className="file-label">
              {file}
            </div>
          ))}
          <div className="corner"></div>
        </div>
        {/* Checkmate Overlay */}
        {gameState.gameStatus === 'checkmate' && (
          <div className="checkmate-overlay">
            <div className="checkmate-content">
              <h2 className="checkmate-title">Checkmate!</h2>
              <p className="checkmate-text">
                {gameState.currentPlayer === 'White' ? 'Black' : 'White'} wins
              </p>
            </div>
          </div>
        )}
        
        {/* Stalemate Overlay */}
        {gameState.gameStatus === 'stalemate' && (
          <div className="checkmate-overlay">
            <div className="checkmate-content">
              <h2 className="checkmate-title">Stalemate!</h2>
              <p className="checkmate-text">Game drawn</p>
            </div>
          </div>
        )}      </div>
    </div>
  )
}

export default ChessBoard
