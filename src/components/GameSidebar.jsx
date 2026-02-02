import './GameSidebar.css'

const GameSidebar = ({ gameState, onNewGame, onRestartGame }) => {
  const getStatusMessage = () => {
    if (gameState.gameStatus === 'checkmate') {
      const winner = gameState.currentPlayer === 'White' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }
    if (gameState.gameStatus === 'stalemate') {
      return 'Stalemate! Game is drawn.';
    }
    if (gameState.gameStatus === 'check') {
      return `${gameState.currentPlayer} is in check!`;
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

      <div className="game-controls">
        <button className="control-btn new-game" onClick={onNewGame}>
          New Game
        </button>
        <button className="control-btn restart-game" onClick={onRestartGame}>
          Restart Game
        </button>
      </div>

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
