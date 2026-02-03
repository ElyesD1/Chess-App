import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

// Store waiting players and active games
const waitingQueue = [];
const activeGames = new Map(); // roomId -> game data
const playerRooms = new Map(); // socketId -> roomId

// Generate unique room ID
const generateRoomId = () => {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Random color assignment (50/50)
const assignColors = () => {
  return Math.random() < 0.5 
    ? { player1: 'White', player2: 'Black' }
    : { player1: 'Black', player2: 'White' };
};

// Check if material is insufficient for checkmate
const hasInsufficientMaterial = (capturedPieces) => {
  // If opponent has only King, or King + Bishop, or King + Knight, insufficient material
  const pieces = capturedPieces || [];
  const totalPieces = pieces.length;
  
  // Count different piece types
  const hasPawn = pieces.includes('Pawn');
  const hasRook = pieces.includes('Rook');
  const hasQueen = pieces.includes('Queen');
  const bishops = pieces.filter(p => p === 'Bishop').length;
  const knights = pieces.filter(p => p === 'Knight').length;
  
  // If they have pawns, rooks, or queens, they can checkmate
  if (hasPawn || hasRook || hasQueen) return false;
  
  // If they have 2+ bishops or 2+ knights, they can checkmate
  if (bishops >= 2 || knights >= 2) return false;
  
  // If they have both bishop and knight, they can checkmate
  if (bishops >= 1 && knights >= 1) return false;
  
  // Otherwise (only King, or King+Bishop, or King+Knight), insufficient material
  return true;
};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins matchmaking queue
  socket.on('join-queue', () => {
    console.log(`Player ${socket.id} joining queue`);
    
    // Check if already in queue
    if (waitingQueue.includes(socket.id)) {
      socket.emit('already-in-queue');
      return;
    }

    // Check if player already in a game
    if (playerRooms.has(socket.id)) {
      socket.emit('already-in-game');
      return;
    }

    // If there's someone waiting, match them
    if (waitingQueue.length > 0) {
      const opponent = waitingQueue.shift();
      const opponentSocket = io.sockets.sockets.get(opponent);
      
      if (!opponentSocket) {
        // Opponent disconnected, try again
        socket.emit('join-queue');
        return;
      }

      // Create new game room
      const roomId = generateRoomId();
      const colors = assignColors();
      
      console.log(`🎨 Color assignment: player1(${socket.id}) = ${colors.player1}, player2(${opponent}) = ${colors.player2}`);
      
      // Setup game
      const gameData = {
        roomId,
        players: {
          [socket.id]: { color: colors.player1, socketId: socket.id, timeLeft: 600000 }, // 10 minutes in ms
          [opponent]: { color: colors.player2, socketId: opponent, timeLeft: 600000 }
        },
        currentPlayer: 'White',
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        gameStatus: 'active'
      };

      activeGames.set(roomId, gameData);
      playerRooms.set(socket.id, roomId);
      playerRooms.set(opponent, roomId);

      // Join both players to room
      socket.join(roomId);
      opponentSocket.join(roomId);

      // Notify both players
      socket.emit('game-start', {
        roomId,
        yourColor: colors.player1,
        opponentId: opponent,
        timeControl: { initial: 600000, increment: 0 } // 10 minutes, no increment
      });
      console.log(`📤 Sent to ${socket.id}: yourColor=${colors.player1}`);

      opponentSocket.emit('game-start', {
        roomId,
        yourColor: colors.player2,
        opponentId: socket.id,
        timeControl: { initial: 600000, increment: 0 }
      });
      console.log(`📤 Sent to ${opponent}: yourColor=${colors.player2}`);

      console.log(`Game started: ${roomId}, ${socket.id} vs ${opponent}`);
    } else {
      // Add to waiting queue
      waitingQueue.push(socket.id);
      socket.emit('waiting-for-opponent');
      console.log(`Player ${socket.id} added to queue. Queue size: ${waitingQueue.length}`);
    }
  });

  // Leave queue
  socket.on('leave-queue', () => {
    const index = waitingQueue.indexOf(socket.id);
    if (index > -1) {
      waitingQueue.splice(index, 1);
      socket.emit('left-queue');
      console.log(`Player ${socket.id} left queue`);
    }
  });

  // Player makes a move
  socket.on('make-move', (moveData) => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) {
      socket.emit('error', { message: 'Not in a game' });
      return;
    }

    const game = activeGames.get(roomId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const player = game.players[socket.id];
    if (!player) {
      socket.emit('error', { message: 'Player not in game' });
      return;
    }

    // Verify it's player's turn
    if (player.color !== game.currentPlayer) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    // Update time for current player
    const now = Date.now();
    const timeElapsed = now - game.lastMoveTime;
    player.timeLeft = Math.max(0, player.timeLeft - timeElapsed);

    // Check if player ran out of time
    if (player.timeLeft <= 0) {
      // Opponent wins by timeout (unless insufficient material)
      const opponentId = Object.keys(game.players).find(id => id !== socket.id);
      const opponentColor = game.players[opponentId].color;
      
      // Check if opponent has insufficient material (draw)
      const insufficientMaterial = hasInsufficientMaterial(moveData.opponentPieces);
      
      if (insufficientMaterial) {
        io.to(roomId).emit('game-over', {
          result: 'draw',
          reason: 'timeout-insufficient-material',
          winner: null
        });
      } else {
        io.to(roomId).emit('game-over', {
          result: 'timeout',
          reason: 'timeout',
          winner: opponentColor
        });
      }
      
      // Clean up game
      activeGames.delete(roomId);
      playerRooms.delete(socket.id);
      playerRooms.delete(opponentId);
      return;
    }

    // Switch turn
    game.currentPlayer = player.color === 'White' ? 'Black' : 'White';
    game.lastMoveTime = now;

    console.log(`Move made by ${socket.id} (${player.color}): from ${JSON.stringify(moveData.move.from)} to ${JSON.stringify(moveData.move.to)}`);
    console.log(`Next player: ${game.currentPlayer}`);

    // Broadcast move to opponent
    socket.to(roomId).emit('opponent-move', {
      move: moveData.move,
      timeLeft: player.timeLeft,
      gameState: moveData.gameState
    });

    console.log(`Move broadcast to opponent in room ${roomId}`);

    // Send confirmation to player
    socket.emit('move-confirmed', {
      timeLeft: player.timeLeft
    });

    // Check for game over conditions from moveData
    if (moveData.gameStatus === 'checkmate' || moveData.gameStatus === 'stalemate') {
      let result, winner = null;
      
      if (moveData.gameStatus === 'checkmate') {
        result = 'checkmate';
        winner = player.color; // Player who made the move wins
      } else {
        result = 'stalemate';
      }

      io.to(roomId).emit('game-over', {
        result,
        reason: moveData.gameStatus,
        winner
      });

      // Clean up
      const opponentId = Object.keys(game.players).find(id => id !== socket.id);
      activeGames.delete(roomId);
      playerRooms.delete(socket.id);
      playerRooms.delete(opponentId);
    }
  });

  // Get current time
  socket.on('get-time', () => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const game = activeGames.get(roomId);
    if (!game) return;

    const player = game.players[socket.id];
    const opponentId = Object.keys(game.players).find(id => id !== socket.id);
    const opponent = game.players[opponentId];

    // Calculate current time for active player
    if (game.currentPlayer === player.color) {
      const timeElapsed = Date.now() - game.lastMoveTime;
      player.timeLeft = Math.max(0, player.timeLeft - timeElapsed);
      game.lastMoveTime = Date.now();
    }

    socket.emit('time-update', {
      yourTime: player.timeLeft,
      opponentTime: opponent.timeLeft,
      currentPlayer: game.currentPlayer
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Remove from queue if waiting
    const queueIndex = waitingQueue.indexOf(socket.id);
    if (queueIndex > -1) {
      waitingQueue.splice(queueIndex, 1);
    }

    // Handle game disconnection
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const game = activeGames.get(roomId);
      if (game) {
        // Notify opponent
        const opponentId = Object.keys(game.players).find(id => id !== socket.id);
        if (opponentId) {
          const opponentColor = game.players[opponentId].color;
          io.to(opponentId).emit('opponent-disconnected', {
            winner: opponentColor
          });
          playerRooms.delete(opponentId);
        }
        
        // Clean up game
        activeGames.delete(roomId);
        playerRooms.delete(socket.id);
      }
    }
  });

  // Resign
  socket.on('resign', () => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const game = activeGames.get(roomId);
    if (!game) return;

    const player = game.players[socket.id];
    const opponentId = Object.keys(game.players).find(id => id !== socket.id);
    const opponentColor = game.players[opponentId].color;

    io.to(roomId).emit('game-over', {
      result: 'resignation',
      reason: 'resignation',
      winner: opponentColor
    });

    // Clean up
    activeGames.delete(roomId);
    playerRooms.delete(socket.id);
    playerRooms.delete(opponentId);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Chess server running on port ${PORT}`);
});
