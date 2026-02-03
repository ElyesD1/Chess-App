// Check if a player has insufficient material to checkmate
export const hasInsufficientMaterial = (board, color) => {
  if (!board) return false;

  let pieces = [];
  
  // Collect all pieces for the specified color
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push(piece.type);
      }
    }
  }

  // Remove king from count
  pieces = pieces.filter(p => p !== 'King');

  // No pieces besides king = insufficient material
  if (pieces.length === 0) return true;

  // Only a knight or bishop = insufficient material
  if (pieces.length === 1) {
    if (pieces[0] === 'Knight' || pieces[0] === 'Bishop') {
      return true;
    }
  }

  // Two knights = insufficient material (can't force checkmate)
  if (pieces.length === 2) {
    if (pieces.every(p => p === 'Knight')) {
      return true;
    }
  }

  // Has pawns, rooks, queens, or multiple bishops/knights = sufficient material
  return false;
};

// Check if current board position is a draw by insufficient material (both sides)
export const isDrawByInsufficientMaterial = (board) => {
  if (!board) return false;

  const whiteInsufficient = hasInsufficientMaterial(board, 'White');
  const blackInsufficient = hasInsufficientMaterial(board, 'Black');

  // If both players have insufficient material, it's a draw
  return whiteInsufficient && blackInsufficient;
};
