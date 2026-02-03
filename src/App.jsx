import { useState, useEffect } from 'react'
import './App.css'
import ChessBoard from './components/ChessBoard'
import GameSidebar from './components/GameSidebar'
import OnlineMatchmaking from './components/OnlineMatchmaking'
import socketService from './utils/socketService'

function App() {
  const [gameState, setGameState] = useState({
    board: null,
    currentPlayer: 'White',
    gameStatus: 'active', // active, check, checkmate, stalemate
    moveHistory: [],
    enPassantTarget: null,
    hasMoved: {
      White: { king: false, rookKingside: false, rookQueenside: false },
      Black: { king: false, rookKingside: false, rookQueenside: false }
    },
    gameMode: null, // null = welcome screen, self, online, computer
    playerColor: 'White', // For computer and online modes
    isFlipped: false,
    gameId: Date.now(), // Add unique ID for each game
    stateHistory: [], // Full state snapshots for takeback/forward
    currentStateIndex: -1, // Current position in history (-1 = initial)
    capturedPieces: { White: [], Black: [] }, // Track captured pieces
    evaluation: 0, // Stockfish evaluation in centipawns (positive = white advantage)
    difficulty: 1200, // Computer difficulty in ELO rating
    // Online game specific
    roomId: null,
    opponentId: null,
    playerTime: 600000, // 10 minutes in ms
    opponentTime: 600000
  });
  const [showMatchmaking, setShowMatchmaking] = useState(false);

  const handleNewGame = (mode = 'self', playerColor = 'White', difficulty = 1200) => {
    if (mode === 'online') {
      // Show matchmaking UI
      setShowMatchmaking(true);
      return;
    }

    const isFlipped = mode === 'computer' && playerColor === 'Black';
    
    setGameState({
      board: null,
      currentPlayer: 'White',
      gameStatus: 'active',
      moveHistory: [],
      enPassantTarget: null,
      hasMoved: {
        White: { king: false, rookKingside: false, rookQueenside: false },
        Black: { king: false, rookKingside: false, rookQueenside: false }
      },
      gameMode: mode,
      playerColor: playerColor,
      isFlipped: isFlipped,
      gameId: Date.now(), // New game ID to trigger re-initialization
      stateHistory: [],
      currentStateIndex: -1,
      capturedPieces: { White: [], Black: [] },
      evaluation: 0,
      difficulty: difficulty,
      roomId: null,
      opponentId: null,
      playerTime: 600000,
      opponentTime: 600000
    });
  };

  const handleOnlineGameStart = (data) => {
    console.log('🎲 Online game started - RAW DATA:', data);
    console.log('🎲 yourColor:', data.yourColor);
    console.log('🎲 roomId:', data.roomId);
    console.log('🎲 opponentId:', data.opponentId);
    setShowMatchmaking(false);
    
    const isFlipped = data.yourColor === 'Black';
    console.log('🎲 Calculated isFlipped:', isFlipped, '(yourColor === Black):', data.yourColor === 'Black');
    
    socketService.setRoomId(data.roomId);
    socketService.setPlayerColor(data.yourColor);
    
    setGameState({
      board: null,
      currentPlayer: 'White',
      gameStatus: 'active',
      moveHistory: [],
      enPassantTarget: null,
      hasMoved: {
        White: { king: false, rookKingside: false, rookQueenside: false },
        Black: { king: false, rookKingside: false, rookQueenside: false }
      },
      gameMode: 'online',
      playerColor: data.yourColor,
      isFlipped: isFlipped,
      gameId: Date.now(),
      stateHistory: [],
      currentStateIndex: -1,
      capturedPieces: { White: [], Black: [] },
      evaluation: 0,
      difficulty: 0,
      roomId: data.roomId,
      opponentId: data.opponentId,
      playerTime: data.timeControl.initial,
      opponentTime: data.timeControl.initial
    });
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);
    socketService.disconnect();
  };

  const handleRestartGame = () => {
    handleNewGame(gameState.gameMode, gameState.playerColor, gameState.difficulty);
  };

  const handleTakeback = () => {
    // In computer mode, takeback TWO moves (player + computer)
    // In other modes, takeback ONE move
    const movesToTakeback = gameState.gameMode === 'computer' ? 2 : 1;
    const targetIndex = gameState.currentStateIndex - movesToTakeback;
    
    if (targetIndex >= -1) {
      const previousState = targetIndex === -1 
        ? {
            board: null,
            currentPlayer: 'White',
            gameStatus: 'active',
            moveHistory: [],
            enPassantTarget: null,
            hasMoved: {
              White: { king: false, rookKingside: false, rookQueenside: false },
              Black: { king: false, rookKingside: false, rookQueenside: false }
            },
            capturedPieces: { White: [], Black: [] },
            evaluation: 0
          }
        : gameState.stateHistory[targetIndex];
      
      setGameState({
        ...previousState,
        currentStateIndex: targetIndex,
        stateHistory: gameState.stateHistory,
        gameMode: gameState.gameMode,
        playerColor: gameState.playerColor,
        isFlipped: gameState.isFlipped,
        gameId: gameState.gameId,
        difficulty: gameState.difficulty
      });
    }
  };

  const handleForward = () => {
    // In computer mode, forward TWO moves (player + computer)
    // In other modes, forward ONE move
    const movesToForward = gameState.gameMode === 'computer' ? 2 : 1;
    const targetIndex = gameState.currentStateIndex + movesToForward;
    
    if (targetIndex < gameState.stateHistory.length) {
      const nextState = gameState.stateHistory[targetIndex];
      setGameState({
        ...nextState,
        currentStateIndex: targetIndex,
        stateHistory: gameState.stateHistory,
        gameMode: gameState.gameMode,
        playerColor: gameState.playerColor,
        isFlipped: gameState.isFlipped,
        gameId: gameState.gameId,
        difficulty: gameState.difficulty
      });
    }
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (gameState.gameMode === 'computer') {
      setGameState(prevState => ({
        ...prevState,
        difficulty: newDifficulty,
        gameId: Date.now() // Trigger Stockfish re-initialization with new difficulty
      }));
    }
  };

  return (
    <div className="app">
      {showMatchmaking && (
        <OnlineMatchmaking 
          onGameStart={handleOnlineGameStart}
          onCancel={handleCancelMatchmaking}
        />
      )}
      <div className="app-container">
        <GameSidebar 
          gameState={gameState}
          onNewGame={handleNewGame}
          onRestartGame={handleRestartGame}
          onTakeback={handleTakeback}
          onForward={handleForward}
          onDifficultyChange={handleDifficultyChange}
        />
        <div className="main-content">
          <ChessBoard 
            gameState={gameState}
            onGameStateChange={setGameState}
          />
        </div>
      </div>
    </div>
  )
}

export default App
