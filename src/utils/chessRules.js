// Chess game rules and move validation

export const isValidMove = (board, from, to, currentPlayer, gameState) => {
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== currentPlayer) return false;

  const targetSquare = board[to.row][to.col];
  if (targetSquare && targetSquare.color === currentPlayer) return false;

  let isValid = false;

  switch (piece.piece) {
    case 'Pawn':
      isValid = isValidPawnMove(board, from, to, piece.color, gameState);
      break;
    case 'Rook':
      isValid = isValidRookMove(board, from, to);
      break;
    case 'Knight':
      isValid = isValidKnightMove(from, to);
      break;
    case 'Bishop':
      isValid = isValidBishopMove(board, from, to);
      break;
    case 'Queen':
      isValid = isValidQueenMove(board, from, to);
      break;
    case 'King':
      isValid = isValidKingMove(board, from, to, piece.color, gameState);
      break;
    default:
      isValid = false;
  }

  if (!isValid) return false;

  // Check if move would leave own king in check
  const testBoard = makeMove(board, from, to);
  if (isKingInCheck(testBoard, currentPlayer)) {
    return false;
  }

  return true;
};

const isValidPawnMove = (board, from, to, color, gameState) => {
  const direction = color === 'White' ? -1 : 1;
  const startRow = color === 'White' ? 6 : 1;
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);

  // Move forward one square
  if (colDiff === 0 && rowDiff === direction) {
    return !board[to.row][to.col];
  }

  // Move forward two squares from starting position
  if (colDiff === 0 && rowDiff === 2 * direction && from.row === startRow) {
    const middleRow = from.row + direction;
    return !board[middleRow][from.col] && !board[to.row][to.col];
  }

  // Capture diagonally
  if (colDiff === 1 && rowDiff === direction) {
    const targetPiece = board[to.row][to.col];
    if (targetPiece && targetPiece.color !== color) {
      return true;
    }

    // En passant
    if (gameState.enPassantTarget &&
        gameState.enPassantTarget.row === to.row &&
        gameState.enPassantTarget.col === to.col) {
      return true;
    }
  }

  return false;
};

const isValidRookMove = (board, from, to) => {
  if (from.row !== to.row && from.col !== to.col) return false;
  return isPathClear(board, from, to);
};

const isValidKnightMove = (from, to) => {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

const isValidBishopMove = (board, from, to) => {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  if (rowDiff !== colDiff) return false;
  return isPathClear(board, from, to);
};

const isValidQueenMove = (board, from, to) => {
  return isValidRookMove(board, from, to) || isValidBishopMove(board, from, to);
};

const isValidKingMove = (board, from, to, color, gameState) => {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  // Normal king move (one square in any direction)
  if (rowDiff <= 1 && colDiff <= 1) {
    return true;
  }

  // Castling
  if (rowDiff === 0 && colDiff === 2) {
    return canCastle(board, from, to, color, gameState);
  }

  return false;
};

const isPathClear = (board, from, to) => {
  const rowStep = Math.sign(to.row - from.row);
  const colStep = Math.sign(to.col - from.col);
  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol]) return false;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
};

const canCastle = (board, from, to, color, gameState) => {
  const row = color === 'White' ? 7 : 0;
  const kingCol = 4;

  // Check if king has moved
  if (gameState.hasMoved[color].king) return false;

  // Queenside castling
  if (to.col === 2) {
    if (gameState.hasMoved[color].rookQueenside) return false;
    if (!isPathClear(board, from, { row, col: 0 })) return false;
    // Check if squares king passes through are under attack
    for (let col = kingCol; col >= 2; col--) {
      if (isSquareUnderAttack(board, { row, col }, color)) return false;
    }
    return true;
  }

  // Kingside castling
  if (to.col === 6) {
    if (gameState.hasMoved[color].rookKingside) return false;
    if (!isPathClear(board, from, { row, col: 7 })) return false;
    // Check if squares king passes through are under attack
    for (let col = kingCol; col <= 6; col++) {
      if (isSquareUnderAttack(board, { row, col }, color)) return false;
    }
    return true;
  }

  return false;
};

export const makeMove = (board, from, to, isActualMove = false) => {
  const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
  const piece = newBoard[from.row][from.col];
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  return newBoard;
};

export const isSquareUnderAttack = (board, square, defendingColor) => {
  const attackingColor = defendingColor === 'White' ? 'Black' : 'White';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === attackingColor) {
        const from = { row, col };
        
        // Special check for pawns (they attack differently than they move)
        if (piece.piece === 'Pawn') {
          const direction = attackingColor === 'White' ? -1 : 1;
          const rowDiff = square.row - row;
          const colDiff = Math.abs(square.col - col);
          if (rowDiff === direction && colDiff === 1) {
            return true;
          }
        } else {
          // For other pieces, use their normal move validation (without recursion)
          let canAttack = false;
          switch (piece.piece) {
            case 'Rook':
              canAttack = isValidRookMove(board, from, square);
              break;
            case 'Knight':
              canAttack = isValidKnightMove(from, square);
              break;
            case 'Bishop':
              canAttack = isValidBishopMove(board, from, square);
              break;
            case 'Queen':
              canAttack = isValidQueenMove(board, from, square);
              break;
            case 'King':
              const rowDiff = Math.abs(square.row - row);
              const colDiff = Math.abs(square.col - col);
              canAttack = rowDiff <= 1 && colDiff <= 1;
              break;
          }
          if (canAttack) return true;
        }
      }
    }
  }

  return false;
};

export const isKingInCheck = (board, color) => {
  // Find king position
  let kingPos = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.piece === 'King' && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;
  return isSquareUnderAttack(board, kingPos, color);
};

export const isCheckmate = (board, color, gameState) => {
  if (!isKingInCheck(board, color)) return false;

  // Check if any move can get out of check
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, { row: fromRow, col: fromCol }, { row: toRow, col: toCol }, color, gameState)) {
              return false; // Found a valid move
            }
          }
        }
      }
    }
  }

  return true; // No valid moves found
};

export const isStalemate = (board, color, gameState) => {
  if (isKingInCheck(board, color)) return false;

  // Check if player has any legal moves
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, { row: fromRow, col: fromCol }, { row: toRow, col: toCol }, color, gameState)) {
              return false; // Found a legal move
            }
          }
        }
      }
    }
  }

  return true; // No legal moves found
};
