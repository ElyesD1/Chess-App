import { useState } from 'react'
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
    }
  });

  const handleNewGame = () => {
    setGameState({
      board: null,
      currentPlayer: 'White',
      gameStatus: 'active',
      moveHistory: [],
      enPassantTarget: null,
      hasMoved: {
        White: { king: false, rookKingside: false, rookQueenside: false },
        Black: { king: false, rookKingside: false, rookQueenside: false }
      }
    });
  };

  const handleRestartGame = () => {
    handleNewGame();
  };

  return (
    <div className="app">
      <div className="app-container">
        <GameSidebar 
          gameState={gameState}
          onNewGame={handleNewGame}
          onRestartGame={handleRestartGame}
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
