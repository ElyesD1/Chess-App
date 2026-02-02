// Convert board position to FEN notation
export const boardToFen = (board, currentPlayer, gameState) => {
  let fen = '';
  
  // 1. Piece placement
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        const pieceChar = getPieceChar(piece);
        fen += pieceChar;
      }
    }
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    if (row < 7) {
      fen += '/';
    }
  }
  
  // 2. Active color
  fen += ' ' + (currentPlayer === 'White' ? 'w' : 'b');
  
  // 3. Castling availability
  let castling = '';
  if (!gameState.hasMoved.White.king) {
    if (!gameState.hasMoved.White.rookKingside) castling += 'K';
    if (!gameState.hasMoved.White.rookQueenside) castling += 'Q';
  }
  if (!gameState.hasMoved.Black.king) {
    if (!gameState.hasMoved.Black.rookKingside) castling += 'k';
    if (!gameState.hasMoved.Black.rookQueenside) castling += 'q';
  }
  fen += ' ' + (castling || '-');
  
  // 4. En passant target square
  if (gameState.enPassantTarget) {
    const file = String.fromCharCode(97 + gameState.enPassantTarget.col);
    const rank = 8 - gameState.enPassantTarget.row;
    fen += ' ' + file + rank;
  } else {
    fen += ' -';
  }
  
  // 5. Halfmove clock (simplified - always 0 for now)
  fen += ' 0';
  
  // 6. Fullmove number
  const fullmove = Math.floor(gameState.moveHistory.length / 2) + 1;
  fen += ' ' + fullmove;
  
  return fen;
};

const getPieceChar = (piece) => {
  const chars = {
    'Pawn': 'p',
    'Rook': 'r',
    'Knight': 'n',
    'Bishop': 'b',
    'Queen': 'q',
    'King': 'k'
  };
  
  const char = chars[piece.piece];
  return piece.color === 'White' ? char.toUpperCase() : char;
};

// Convert UCI move (e.g., "e2e4") to board coordinates
export const uciToMove = (uci) => {
  const fromFile = uci.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const fromRank = parseInt(uci[1]); // 1-8
  const toFile = uci.charCodeAt(2) - 97;
  const toRank = parseInt(uci[3]); // 1-8
  
  // Convert chess rank (1-8) to array index (7-0)
  // Rank 1 = row 7, Rank 8 = row 0
  return {
    from: { row: 8 - fromRank, col: fromFile },
    to: { row: 8 - toRank, col: toFile },
    promotion: uci[4] // If present (e.g., 'q' for queen)
  };
};

// Convert board move to UCI notation
export const moveToUci = (from, to) => {
  const fromFile = String.fromCharCode(97 + from.col);
  const fromRank = 8 - from.row;
  const toFile = String.fromCharCode(97 + to.col);
  const toRank = 8 - to.row;
  
  return fromFile + fromRank + toFile + toRank;
};
