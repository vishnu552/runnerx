'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="countdown-section">
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="countdown-label">Days</div>
      </div>
      <div className="countdown-colon">:</div>
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="countdown-label">Hours</div>
      </div>
      <div className="countdown-colon">:</div>
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="countdown-label">Minutes</div>
      </div>
      <div className="countdown-colon">:</div>
      <div className="countdown-unit">
        <div className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="countdown-label">Seconds</div>
      </div>
    </div>
  );
}
