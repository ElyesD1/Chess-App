import { useState, useEffect } from 'react';
import './OnlineMatchmaking.css';
import socketService from '../utils/socketService';

const OnlineMatchmaking = ({ onGameStart, onCancel }) => {
  const [status, setStatus] = useState('connecting'); // connecting, waiting, matched
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Connect to server
    const socket = socketService.connect();

    socketService.onWaitingForOpponent(() => {
      setStatus('waiting');
    });

    socketService.onGameStart((data) => {
      setStatus('matched');
      setTimeout(() => {
        onGameStart(data);
      }, 1000);
    });

    socketService.onError((error) => {
      console.error('Socket error:', error);
      alert('Error: ' + error.message);
    });

    // Join queue when component mounts
    if (socket.connected) {
      socketService.joinQueue();
    } else {
      socket.on('connect', () => {
        socketService.joinQueue();
      });
    }

    return () => {
      // Clean up listeners
      socketService.offWaitingForOpponent();
      socketService.offGameStart();
      socketService.offError();
    };
  }, [onGameStart]);

  const handleCancel = () => {
    socketService.leaveQueue();
    onCancel();
  };

  return (
    <div className="matchmaking-overlay">
      <div className="matchmaking-modal">
        <div className="matchmaking-content">
          {status === 'connecting' && (
            <>
              <div className="matchmaking-spinner"></div>
              <h2>Connecting{dots}</h2>
              <p>Establishing connection to server</p>
            </>
          )}
          
          {status === 'waiting' && (
            <>
              <div className="matchmaking-spinner searching"></div>
              <h2>Searching for Opponent{dots}</h2>
              <p>Please wait while we find you a worthy adversary</p>
            </>
          )}
          
          {status === 'matched' && (
            <>
              <div className="match-found-icon">♔</div>
              <h2>Opponent Found</h2>
              <p>Preparing the board...</p>
            </>
          )}
        </div>
        
        {status !== 'matched' && (
          <button className="cancel-matchmaking-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default OnlineMatchmaking;
