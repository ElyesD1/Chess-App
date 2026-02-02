import { useState, useEffect } from 'react'
import './ChessBoard.css'
import { isValidMove, makeMove, isKingInCheck, isCheckmate, isStalemate } from '../utils/chessRules'

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

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  // Determine if a square is light or dark
  const isLightSquare = (row, col) => (row + col) % 2 !== 0

  useEffect(() => {
    if (!gameState.board) {
      onGameStateChange({ ...gameState, board: getInitialBoard() });
    }
  }, []);

  const handleSquareClick = (row, col) => {
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
        const newBoard = makeMove(board, from, to);
        const movingPiece = board[from.row][from.col];
        
        // Handle pawn promotion
        if (movingPiece.piece === 'Pawn' && (to.row === 0 || to.row === 7)) {
          // Auto-promote to Queen for now
          newBoard[to.row][to.col] = {
            piece: 'Queen',
            color: movingPiece.color,
            image: pieceImages[`${movingPiece.color}-Queen`]
          };
        }

        // Handle castling - move the rook
        if (movingPiece.piece === 'King' && Math.abs(to.col - from.col) === 2) {
          const isKingside = to.col > from.col;
          const rookFromCol = isKingside ? 7 : 0;
          const rookToCol = isKingside ? 5 : 3;
          const { row } = from;
          newBoard[row][rookToCol] = newBoard[row][rookFromCol];
          newBoard[row][rookFromCol] = null;
        }

        // Handle en passant capture
        if (movingPiece.piece === 'Pawn' && 
            gameState.enPassantTarget &&
            to.row === gameState.enPassantTarget.row &&
            to.col === gameState.enPassantTarget.col) {
          const capturedPawnRow = movingPiece.color === 'White' ? to.row + 1 : to.row - 1;
          newBoard[capturedPawnRow][to.col] = null;
        }

        // Update en passant target
        let newEnPassantTarget = null;
        if (movingPiece.piece === 'Pawn' && Math.abs(to.row - from.row) === 2) {
          const targetRow = movingPiece.color === 'White' ? from.row - 1 : from.row + 1;
          newEnPassantTarget = { row: targetRow, col: from.col };
        }

        // Update has moved flags for castling
        const newHasMoved = { ...gameState.hasMoved };
        if (movingPiece.piece === 'King') {
          newHasMoved[movingPiece.color].king = true;
        }
        if (movingPiece.piece === 'Rook') {
          if (from.col === 0) {
            newHasMoved[movingPiece.color].rookQueenside = true;
          } else if (from.col === 7) {
            newHasMoved[movingPiece.color].rookKingside = true;
          }
        }

        // Switch player
        const nextPlayer = gameState.currentPlayer === 'White' ? 'Black' : 'White';

        // Create move notation
        const pieceSymbol = movingPiece.piece === 'Pawn' ? '' : movingPiece.piece[0];
        const capture = board[to.row][to.col] ? 'x' : '';
        const toSquare = files[to.col] + ranks[to.row];
        const moveNotation = pieceSymbol + capture + toSquare;

        // Check game status
        let newStatus = 'active';
        if (isKingInCheck(newBoard, nextPlayer)) {
          if (isCheckmate(newBoard, nextPlayer, { ...gameState, hasMoved: newHasMoved, enPassantTarget: newEnPassantTarget })) {
            newStatus = 'checkmate';
          } else {
            newStatus = 'check';
          }
        } else if (isStalemate(newBoard, nextPlayer, { ...gameState, hasMoved: newHasMoved, enPassantTarget: newEnPassantTarget })) {
          newStatus = 'stalemate';
        }

        // Update game state
        onGameStateChange({
          ...gameState,
          board: newBoard,
          currentPlayer: nextPlayer,
          gameStatus: newStatus,
          enPassantTarget: newEnPassantTarget,
          hasMoved: newHasMoved,
          moveHistory: [...gameState.moveHistory, moveNotation]
        });

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

  return (
    <div className="chess-container">
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
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((square, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`square ${
                      isLightSquare(rowIndex, colIndex) ? 'light' : 'dark'
                    } ${
                      selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex
                        ? 'selected'
                        : ''
                    } ${
                      isValidMoveSquare(rowIndex, colIndex) ? 'valid-move' : ''
                    }`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {square && (
                      <img
                        src={square.image}
                        alt={`${square.color} ${square.piece}`}
                        className="piece"
                      />
                    )}
                    {isValidMoveSquare(rowIndex, colIndex) && (
                      <div className={`move-indicator ${square ? 'capture' : ''}`} />
                    )}
                  </div>
                ))}
              </div>
            ))}
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
      </div>
    </div>
  )
}

export default ChessBoard
