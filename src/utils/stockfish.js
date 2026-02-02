import { spawn } from 'child_process';

class StockfishEngine {
  constructor() {
    this.engine = null;
    this.onMessage = null;
  }

  init() {
    // Use the Stockfish binary installed via Homebrew
    this.engine = spawn('/opt/homebrew/bin/stockfish');
    
    this.engine.stdout.on('data', (data) => {
      const message = data.toString();
      if (this.onMessage) {
        this.onMessage(message);
      }
    });

    this.engine.stderr.on('data', (data) => {
      console.error('Stockfish error:', data.toString());
    });

    // Initialize UCI
    this.send('uci');
  }

  send(command) {
    if (this.engine) {
      this.engine.stdin.write(command + '\n');
    }
  }

  async getBestMove(fen, depth = 15) {
    return new Promise((resolve) => {
      let bestMove = null;

      this.onMessage = (message) => {
        if (message.includes('bestmove')) {
          const match = message.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
          if (match) {
            bestMove = match[1];
            resolve(bestMove);
          }
        }
      };

      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  quit() {
    if (this.engine) {
      this.send('quit');
      this.engine = null;
    }
  }
}

export const stockfish = new StockfishEngine();
