import { Server } from 'socket.io';

// Store waiting players and active games
const waitingQueue = [];
const activeGames = new Map();
const playerRooms = new Map();

const generateRoomId = () => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const assignColors = () => {
  return Math.random() < 0.5 
    ? { player1: 'White', player2: 'Black' }
    : { player1: 'Black', player2: 'White' };
};

const hasInsufficientMaterial = (capturedPieces) => {
  const pieces = capturedPieces || [];
  const hasPawn = pieces.includes('Pawn');
  const hasRook = pieces.includes('Rook');
  const hasQueen = pieces.includes('Queen');
  const bishops = pieces.filter(p => p === 'Bishop').length;
  const knights = pieces.filter(p => p === 'Knight').length;
  
  if (hasPawn || hasRook || hasQueen) return false;
  if (bishops >= 2 || knights >= 2) return false;
  if (bishops >= 1 && knights >= 1) return false;
  
  return true;
};

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/socket.io',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('New player connected:', socket.id);

      socket.on('join-queue', () => {
        if (waitingQueue.length > 0) {
          const opponent = waitingQueue.shift();
          const roomId = generateRoomId();
          const colors = assignColors();
          
          socket.join(roomId);
          opponent.join(roomId);
          
          playerRooms.set(socket.id, roomId);
          playerRooms.set(opponent.id, roomId);
          
          const gameState = {
            roomId,
            players: {
              [socket.id]: colors.player1,
              [opponent.id]: colors.player2
            },
            currentPlayer: 'White',
            startTime: Date.now(),
            timeControl: 600000,
            playerTimes: {
              White: 600000,
              Black: 600000
            },
            lastMoveTime: Date.now(),
            moveHistory: [],
            capturedPieces: { White: [], Black: [] }
          };
          
          activeGames.set(roomId, gameState);
          
          socket.emit('game-start', {
            roomId,
            yourColor: colors.player1,
            opponentColor: colors.player2,
            timeControl: 600000
          });
          
          opponent.emit('game-start', {
            roomId,
            yourColor: colors.player2,
            opponentColor: colors.player1,
            timeControl: 600000
          });
        } else {
          waitingQueue.push(socket);
          socket.emit('waiting-for-opponent');
        }
      });

      socket.on('leave-queue', () => {
        const index = waitingQueue.indexOf(socket);
        if (index > -1) {
          waitingQueue.splice(index, 1);
        }
      });

      socket.on('make-move', (data) => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        
        const game = activeGames.get(roomId);
        if (!game) return;
        
        const playerColor = game.players[socket.id];
        if (playerColor !== game.currentPlayer) return;
        
        const now = Date.now();
        const timeElapsed = now - game.lastMoveTime;
        
        game.playerTimes[playerColor] = Math.max(0, game.playerTimes[playerColor] - timeElapsed);
        
        if (game.playerTimes[playerColor] === 0) {
          io.to(roomId).emit('game-over', {
            result: `${playerColor === 'White' ? 'Black' : 'White'} wins by timeout`,
            winner: playerColor === 'White' ? 'Black' : 'White'
          });
          return;
        }
        
        game.currentPlayer = playerColor === 'White' ? 'Black' : 'White';
        game.lastMoveTime = now;
        game.moveHistory.push(data);
        
        if (data.capturedPiece) {
          game.capturedPieces[playerColor].push(data.capturedPiece);
        }
        
        socket.to(roomId).emit('opponent-move', {
          move: data,
          timeLeft: game.playerTimes
        });
        
        socket.emit('move-accepted', {
          timeLeft: game.playerTimes
        });
        
        if (data.isCheckmate) {
          io.to(roomId).emit('game-over', {
            result: `Checkmate! ${playerColor} wins`,
            winner: playerColor
          });
        } else if (data.isStalemate) {
          io.to(roomId).emit('game-over', {
            result: 'Stalemate - Draw',
            winner: null
          });
        } else if (hasInsufficientMaterial(game.capturedPieces[playerColor])) {
          io.to(roomId).emit('game-over', {
            result: 'Draw by insufficient material',
            winner: null
          });
        }
      });

      socket.on('resign', () => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        
        const game = activeGames.get(roomId);
        if (!game) return;
        
        const playerColor = game.players[socket.id];
        const winner = playerColor === 'White' ? 'Black' : 'White';
        
        io.to(roomId).emit('game-over', {
          result: `${playerColor} resigned. ${winner} wins!`,
          winner
        });
        
        activeGames.delete(roomId);
      });

      socket.on('disconnect', () => {
        const queueIndex = waitingQueue.indexOf(socket);
        if (queueIndex > -1) {
          waitingQueue.splice(queueIndex, 1);
        }
        
        const roomId = playerRooms.get(socket.id);
        if (roomId) {
          const game = activeGames.get(roomId);
          if (game) {
            const playerColor = game.players[socket.id];
            const winner = playerColor === 'White' ? 'Black' : 'White';
            
            socket.to(roomId).emit('game-over', {
              result: `${playerColor} disconnected. ${winner} wins!`,
              winner
            });
            
            activeGames.delete(roomId);
          }
          playerRooms.delete(socket.id);
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
