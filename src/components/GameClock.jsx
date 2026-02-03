import { useState, useEffect } from 'react';
import './GameClock.css';

const GameClock = ({ initialTime, isActive, onTimeout, playerColor, currentPlayer }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const isMyTurn = playerColor === currentPlayer;

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || !isMyTurn) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 100);
        if (newTime === 0 && onTimeout) {
          onTimeout();
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isMyTurn, onTimeout]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 60000; // Less than 1 minute
  const isCritical = timeLeft < 20000; // Less than 20 seconds

  return (
    <div className={`game-clock ${isActive && isMyTurn ? 'active' : ''} ${isLowTime ? 'low-time' : ''} ${isCritical ? 'critical' : ''}`}>
      <div className="clock-time">{formatTime(timeLeft)}</div>
    </div>
  );
};

export default GameClock;
