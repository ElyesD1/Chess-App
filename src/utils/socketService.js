import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.roomId = null;
    this.playerColor = null;
  }

  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.roomId = null;
      this.playerColor = null;
    }
  }

  joinQueue() {
    if (this.socket && this.connected) {
      this.socket.emit('join-queue');
    }
  }

  leaveQueue() {
    if (this.socket && this.connected) {
      this.socket.emit('leave-queue');
    }
  }

  makeMove(moveData) {
    if (this.socket && this.connected && this.roomId) {
      this.socket.emit('make-move', moveData);
    }
  }

  getTime() {
    if (this.socket && this.connected && this.roomId) {
      this.socket.emit('get-time');
    }
  }

  resign() {
    if (this.socket && this.connected && this.roomId) {
      this.socket.emit('resign');
    }
  }

  setRoomId(roomId) {
    this.roomId = roomId;
  }

  setPlayerColor(color) {
    this.playerColor = color;
  }

  // Event listeners
  onWaitingForOpponent(callback) {
    if (this.socket) {
      this.socket.on('waiting-for-opponent', callback);
    }
  }

  onGameStart(callback) {
    if (this.socket) {
      this.socket.on('game-start', callback);
    }
  }

  onOpponentMove(callback) {
    if (this.socket) {
      this.socket.on('opponent-move', callback);
    }
  }

  onMoveConfirmed(callback) {
    if (this.socket) {
      this.socket.on('move-confirmed', callback);
    }
  }

  onGameOver(callback) {
    if (this.socket) {
      this.socket.on('game-over', callback);
    }
  }

  onOpponentDisconnected(callback) {
    if (this.socket) {
      this.socket.on('opponent-disconnected', callback);
    }
  }

  onTimeUpdate(callback) {
    if (this.socket) {
      this.socket.on('time-update', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  offWaitingForOpponent() {
    if (this.socket) {
      this.socket.off('waiting-for-opponent');
    }
  }

  offGameStart() {
    if (this.socket) {
      this.socket.off('game-start');
    }
  }

  offOpponentMove() {
    if (this.socket) {
      this.socket.off('opponent-move');
    }
  }

  offMoveConfirmed() {
    if (this.socket) {
      this.socket.off('move-confirmed');
    }
  }

  offGameOver() {
    if (this.socket) {
      this.socket.off('game-over');
    }
  }

  offOpponentDisconnected() {
    if (this.socket) {
      this.socket.off('opponent-disconnected');
    }
  }

  offTimeUpdate() {
    if (this.socket) {
      this.socket.off('time-update');
    }
  }

  offError() {
    if (this.socket) {
      this.socket.off('error');
    }
  }

  // Clean up all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
