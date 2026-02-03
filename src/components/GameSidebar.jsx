import { useState } from 'react'
import './GameSidebar.css'

// Elegant chess difficulty levels
const DIFFICULTY_LEVELS = [
  { level: 1, elo: 800, name: 'Beginner', description: 'New to chess', color: '#8b7355' },
  { level: 2, elo: 1000, name: 'Casual', description: 'Learning the game', color: '#a0826d' },
  { level: 3, elo: 1200, name: 'Intermediate', description: 'Knows basic tactics', color: '#b8956f' },
  { level: 4, elo: 1400, name: 'Advanced', description: 'Experienced player', color: '#d4af76' },
  { level: 5, elo: 1600, name: 'Strong', description: 'Club player', color: '#c9a961' },
  { level: 6, elo: 1800, name: 'Expert', description: 'Tournament level', color: '#b8935c' },
  { level: 7, elo: 2200, name: 'Master', description: 'Very strong', color: '#a67c52' },
  { level: 8, elo: 3200, name: 'Maximum', description: 'Full engine power', color: '#8b6639' }
];

const GameSidebar = ({ gameState, onNewGame, onRestartGame, onTakeback, onForward, onDifficultyChange }) => {
  const [showGameModeSelect, setShowGameModeSelect] = useState(false);
  const [showColorSelect, setShowColorSelect] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(2); // Default: Level 3 (Intermediate)

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
      setShowDifficultySelect(true);
    } else {
      setShowGameModeSelect(false);
      setShowColorSelect(false);
      setShowDifficultySelect(false);
      onNewGame(mode);
    }
  };

  const handleDifficultySelect = () => {
    setShowDifficultySelect(false);
    setShowColorSelect(true);
  };

  const handleColorSelect = (color) => {
    setShowColorSelect(false);
    setShowGameModeSelect(false);
    setShowDifficultySelect(false);
    const difficulty = DIFFICULTY_LEVELS[selectedDifficulty];
    onNewGame('computer', color, difficulty.elo);
  };

  const handleDifficultyChange = (index) => {
    setSelectedDifficulty(index);
    if (gameState.gameMode === 'computer' && onDifficultyChange) {
      onDifficultyChange(DIFFICULTY_LEVELS[index].elo);
    }
  };

  const handleCancelSelection = () => {
    setShowGameModeSelect(false);
    setShowColorSelect(false);
    setShowDifficultySelect(false);
  };

  const handleBackFromColor = () => {
    setShowColorSelect(false);
    setShowDifficultySelect(true);
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

      {/* Hide takeback/forward in online mode */}
      {gameState.gameMode !== 'online' && (
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
      )}

      {showGameModeSelect && (
        <div className="modal-overlay" onClick={handleCancelSelection}>
          <div className="game-mode-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Game Mode</h3>
            <button className="mode-btn" onClick={() => handleGameModeSelect('self')}>
              <div className="mode-header">
                <span className="mode-title">Practice Mode</span>
              </div>
              <span className="mode-desc">Analyze and practice positions</span>
            </button>
            <button className="mode-btn" onClick={() => handleGameModeSelect('online')}>
              <div className="mode-header">
                <span className="mode-title">Play Online</span>
              </div>
              <span className="mode-desc">Match with real players</span>
            </button>
            <button className="mode-btn" onClick={() => handleGameModeSelect('computer')}>
              <div className="mode-header">
                <span className="mode-title">Play Computer</span>
              </div>
              <span className="mode-desc">Challenge the engine</span>
            </button>
            <button className="cancel-btn" onClick={handleCancelSelection}>Cancel</button>
          </div>
        </div>
      )}

      {showDifficultySelect && (
        <div className="modal-overlay" onClick={handleCancelSelection}>
          <div className="difficulty-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Engine Difficulty</h3>
            <div className="difficulty-info">
              <div className="difficulty-header">
                <div className="difficulty-level-display">
                  <span className="level-number">{DIFFICULTY_LEVELS[selectedDifficulty].level}</span>
                </div>
                <div className="difficulty-text">
                  <div className="difficulty-name">{DIFFICULTY_LEVELS[selectedDifficulty].name}</div>
                  <div className="difficulty-description">{DIFFICULTY_LEVELS[selectedDifficulty].description}</div>
                </div>
              </div>
            </div>
            
            <div className="difficulty-slider-container">
              <input 
                type="range" 
                min="0" 
                max={DIFFICULTY_LEVELS.length - 1}
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyChange(parseInt(e.target.value))}
                className="difficulty-slider"
              />
              <div className="difficulty-labels">
                {DIFFICULTY_LEVELS.map((level, index) => (
                  <div 
                    key={index} 
                    className={`difficulty-label ${index === selectedDifficulty ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange(index)}
                  >
                    <div className="label-level">{level.level}</div>
                    <div className="label-name">{level.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="difficulty-actions">
              <button className="cancel-btn" onClick={handleCancelSelection}>Cancel</button>
              <button className="confirm-btn" onClick={handleDifficultySelect}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {showColorSelect && (
        <div className="modal-overlay" onClick={handleCancelSelection}>
          <div className="game-mode-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Your Color</h3>
            <button className="mode-btn color-btn" onClick={() => handleColorSelect('White')}>
              <div className="mode-header">
                <span className="mode-title">Play as White</span>
              </div>
              <span className="mode-desc">You move first</span>
            </button>
            <button className="mode-btn color-btn" onClick={() => handleColorSelect('Black')}>
              <div className="mode-header">
                <span className="mode-title">Play as Black</span>
              </div>
              <span className="mode-desc">Computer moves first</span>
            </button>
            <button className="cancel-btn" onClick={handleBackFromColor}>Back</button>
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

      {gameState.gameMode === 'computer' && gameState.difficulty && (
        <div className="current-difficulty">
          <h3>Engine Difficulty</h3>
          <div className="difficulty-display">
            <div className="difficulty-badge">
              <span className="badge-number">{DIFFICULTY_LEVELS.find(d => d.elo === gameState.difficulty)?.level || '?'}</span>
            </div>
            <div className="difficulty-details">
              <div className="difficulty-level-name">
                {DIFFICULTY_LEVELS.find(d => d.elo === gameState.difficulty)?.name || 'Custom'}
              </div>
              <div className="difficulty-level-desc">
                {DIFFICULTY_LEVELS.find(d => d.elo === gameState.difficulty)?.description || 'AI opponent'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="game-info">
        <h3>How to Play</h3>
        <ul>
          <li>Click a piece to select it</li>
          <li>Click a highlighted square to move</li>
          <li>White always moves first</li>
          <li>Players alternate turns</li>
          {gameState.gameMode === 'online' && (
            <>
              <li><strong>Online Rules:</strong></li>
              <li>Each player has 10 minutes</li>
              <li>If time runs out, you lose</li>
              <li>Draw if opponent can't checkmate</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GameSidebar;
