import { useState, useEffect } from 'react'
import './App.css'
import ChessBoard from './components/ChessBoard'
import GameSidebar from './components/GameSidebar'

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
    gameMode: 'self', // self, friend, computer
    playerColor: 'White', // For computer mode
    isFlipped: false,
    gameId: Date.now(), // Add unique ID for each game
    stateHistory: [], // Full state snapshots for takeback/forward
    currentStateIndex: -1, // Current position in history (-1 = initial)
    capturedPieces: { White: [], Black: [] }, // Track captured pieces
    evaluation: 0 // Stockfish evaluation in centipawns (positive = white advantage)
  });

  const handleNewGame = (mode = 'self', playerColor = 'White') => {
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
      evaluation: 0
    });
  };

  const handleRestartGame = () => {
    handleNewGame(gameState.gameMode, gameState.playerColor);
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
        gameId: gameState.gameId
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
        gameId: gameState.gameId
      });
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <GameSidebar 
          gameState={gameState}
          onNewGame={handleNewGame}
          onRestartGame={handleRestartGame}
          onTakeback={handleTakeback}
          onForward={handleForward}
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
