// Stockfish Web Worker
let stockfish = null;
let isReady = false;

self.onmessage = function(e) {
  const { type, fen, depth } = e.data;
  
  if (type === 'init') {
    initStockfish();
  } else if (type === 'getMove') {
    if (isReady && stockfish) {
      getBestMove(fen, depth || 15);
    } else {
      self.postMessage({ type: 'error', message: 'Stockfish not ready yet' });
    }
  }
};

async function initStockfish() {
  try {
    // Load Stockfish from local files
    importScripts('/stockfishjs/stockfish-17.1-lite-51f59da.js');
    
    if (typeof STOCKFISH === 'function') {
      stockfish = STOCKFISH();
      
      stockfish.onmessage = function(line) {
        console.log('Stockfish:', line);
        
        if (line.includes('uciok')) {
          isReady = true;
          stockfish.postMessage('isready');
          self.postMessage({ type: 'ready' });
        } else if (line.includes('readyok')) {
          self.postMessage({ type: 'ready' });
        } else if (line.includes('bestmove')) {
          const match = line.match(/bestmove ([a-h][1-8][a-h][1-8][qrbnQRBN]?)/);
          if (match) {
            self.postMessage({ type: 'bestMove', move: match[1] });
          }
        }
      };
      
      stockfish.postMessage('uci');
    } else {
      throw new Error('STOCKFISH function not found');
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: 'Failed to load Stockfish: ' + error.message });
  }
}

async function getBestMove(fen, depth = 15) {
  if (!stockfish) {
    self.postMessage({ type: 'error', message: 'Stockfish not initialized' });
    return;
  }

  stockfish.postMessage('ucinewgame');
  stockfish.postMessage(`position fen ${fen}`);
  stockfish.postMessage(`go depth ${depth}`);
}

async function getBestMove(fen, depth = 15) {
  if (!stockfish) {
    self.postMessage({ type: 'error', message: 'Engine not initialized' });
    return;
  }

  stockfish.postMessage('ucinewgame');
  stockfish.postMessage(`position fen ${fen}`);
  stockfish.postMessage(`go depth ${depth}`);
}

function makeRandomMove(fen) {
  // Fallback: generate a random legal move
  // This is just for demonstration - replace with real Stockfish
  const moves = ['e2e4', 'd2d4', 'g1f3', 'b1c3'];
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  
  setTimeout(() => {
    self.postMessage({ type: 'bestMove', move: randomMove });
  }, 500);
}
