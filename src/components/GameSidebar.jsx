import { useState } from 'react'
import './GameSidebar.css'

const GameSidebar = ({ gameState, onNewGame, onRestartGame, onTakeback, onForward }) => {
  const [showGameModeSelect, setShowGameModeSelect] = useState(false);
  const [showColorSelect, setShowColorSelect] = useState(false);

  const movesToTakeback = gameState.gameMode === 'computer' ? 2 : 1;
  const canTakeback = gameState.currentStateIndex >= movesToTakeback - 1;
  const canForward = gameState.currentStateIndex < (gameState.stateHistory?.length || 0) - movesToTakeback;

  const getStatusMessage = () => {
    if (gameState.gameStatus === 'checkmate') {
      const winner = gameState.currentPlayer === 'White' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }
    if (gameState.gameStatus === 'stalemate') {
      return 'Stalemate! Game is drawn.';
    }
    if (gameState.gameStatus === 'check') {
      return `${gameState.currentPlayer}'s turn - IN CHECK!`;
    }
    return `${gameState.currentPlayer}'s turn`;
  };

  const getMoveHistory = () => {
    return gameState.moveHistory.map((move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      const isWhiteMove = index % 2 === 0;
      return {
        moveNumber,
        isWhiteMove,
        notation: move,
      };
    });
  };

  const groupedMoves = [];
  const history = getMoveHistory();
  for (let i = 0; i < history.length; i += 2) {
    groupedMoves.push({
      moveNumber: history[i].moveNumber,
      white: history[i].notation,
      black: history[i + 1]?.notation || '',
    });
  }

  const handleNewGameClick = () => {
    setShowGameModeSelect(true);
  };

  const handleGameModeSelect = (mode) => {
    if (mode === 'computer') {
      setShowGameModeSelect(false);
      setShowColorSelect(true);
    } else {
      setShowGameModeSelect(false);
      setShowColorSelect(false);
      onNewGame(mode);
    }
  };

  const handleColorSelect = (color) => {
    setShowColorSelect(false);
    setShowGameModeSelect(false);
    onNewGame('computer', color);
  };

  const handleCancelSelection = () => {
    setShowGameModeSelect(false);
    setShowColorSelect(false);
  };

  const pieceValues = {
    'Pawn': 1, 'Knight': 3, 'Bishop': 3, 'Rook': 5, 'Queen': 9
  };

  const getCapturedPiecesDisplay = (color) => {
    const captured = gameState.capturedPieces?.[color] || [];
    const symbols = {
      'Pawn': '♟', 'Knight': '♞', 'Bishop': '♝', 'Rook': '♜', 'Queen': '♛'
    };
    return captured.map((piece, i) => (
      <span key={i} className="captured-piece">{symbols[piece]}</span>
    ));
  };

  const getMaterialAdvantage = () => {
    const whiteCaptured = gameState.capturedPieces?.White || [];
    const blackCaptured = gameState.capturedPieces?.Black || [];
    const whiteValue = whiteCaptured.reduce((sum, piece) => sum + (pieceValues[piece] || 0), 0);
    const blackValue = blackCaptured.reduce((sum, piece) => sum + (pieceValues[piece] || 0), 0);
    const diff = whiteValue - blackValue;
    return { diff, leader: diff > 0 ? 'White' : diff < 0 ? 'Black' : null };
  };

  const materialAdv = getMaterialAdvantage();

  return (
    <div className="game-sidebar">
      <div className="sidebar-header">
        <h2>Chess Game</h2>
      </div>

      <div className="game-status">
        <div className={`status-indicator ${gameState.gameStatus}`}>
          {getStatusMessage()}
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="captured-pieces-section">
        <div className="captured-row">
          <span className="player-label">Black Captured:</span>
          <div className="pieces-container">
            {getCapturedPiecesDisplay('Black')}
            {materialAdv.leader === 'Black' && (
              <span className="material-advantage">+{Math.abs(materialAdv.diff)}</span>
            )}
          </div>
        </div>
        <div className="captured-row">
          <span className="player-label">White Captured:</span>
          <div className="pieces-container">
            {getCapturedPiecesDisplay('White')}
            {materialAdv.leader === 'White' && (
              <span className="material-advantage">+{Math.abs(materialAdv.diff)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="game-controls">
        <button className="control-btn new-game" onClick={handleNewGameClick}>
          New Game
        </button>
        <button className="control-btn restart-game" onClick={onRestartGame}>
          Restart Game
        </button>
      </div>

      <div className="move-controls">
        <button 
          className="move-control-btn" 
          onClick={onTakeback}
          disabled={!canTakeback}
          title="Takeback (Undo move)"
        >
          <span className="btn-icon">◀</span>
          <span className="btn-text">Takeback</span>
        </button>
        <button 
          className="move-control-btn" 
          onClick={onForward}
          disabled={!canForward}
          title="Forward (Redo move)"
        >
          <span className="btn-text">Forward</span>
          <span className="btn-icon">▶</span>
        </button>
      </div>

      {showGameModeSelect && (
        <div className="modal-overlay" onClick={handleCancelSelection}>
          <div className="game-mode-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Game Mode</h3>
            <button className="mode-btn" onClick={() => handleGameModeSelect('self')}>
              <span className="mode-icon">♟️</span>
              <span className="mode-title">Play Against Yourself</span>
              <span className="mode-desc">Practice and analyze</span>
            </button>
            <button className="mode-btn" onClick={() => handleGameModeSelect('friend')}>
              <span className="mode-icon">👥</span>
              <span className="mode-title">Play Against Friend</span>
              <span className="mode-desc">Local multiplayer</span>
            </button>
            <button className="mode-btn" onClick={() => handleGameModeSelect('computer')}>
              <span className="mode-icon">🤖</span>
              <span className="mode-title">Play Against Computer</span>
              <span className="mode-desc">Challenge Stockfish AI</span>
            </button>
            <button className="cancel-btn" onClick={handleCancelSelection}>Cancel</button>
          </div>
        </div>
      )}

      {showColorSelect && (
        <div className="modal-overlay" onClick={handleCancelSelection}>
          <div className="game-mode-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Your Color</h3>
            <button className="mode-btn color-btn" onClick={() => handleColorSelect('White')}>
              <span className="mode-icon">⚪</span>
              <span className="mode-title">Play as White</span>
              <span className="mode-desc">You move first</span>
            </button>
            <button className="mode-btn color-btn" onClick={() => handleColorSelect('Black')}>
              <span className="mode-icon">⚫</span>
              <span className="mode-title">Play as Black</span>
              <span className="mode-desc">Computer moves first</span>
            </button>
            <button className="cancel-btn" onClick={handleCancelSelection}>Back</button>
          </div>
        </div>
      )}

      <div className="move-history">
        <h3>Move History</h3>
        <div className="moves-list">
          {groupedMoves.length === 0 ? (
            <div className="no-moves">No moves yet</div>
          ) : (
            groupedMoves.map((move) => (
              <div key={move.moveNumber} className="move-row">
                <span className="move-number">{move.moveNumber}.</span>
                <span className="move white-move">{move.white}</span>
                {move.black && <span className="move black-move">{move.black}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="game-info">
        <h3>How to Play</h3>
        <ul>
          <li>Click a piece to select it</li>
          <li>Click a highlighted square to move</li>
          <li>White always moves first</li>
          <li>Players alternate turns</li>
        </ul>
      </div>
    </div>
  );
};

export default GameSidebar;
