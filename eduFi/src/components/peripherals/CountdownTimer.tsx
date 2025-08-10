import React, { useState } from 'react';

interface TimeRemaining { 
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const initialTimeLeft : TimeRemaining = {days: 0, hours: 0, minutes: 0, seconds: 0};

export default function CountDownTimer({ targetDate, notification }: { targetDate: bigint, notification: string }) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(initialTimeLeft); // Initialize with 0 or calculate initial time
    const intervalRef = React.useRef<NodeJS.Timeout | number | undefined>(0);

    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const toNumber = Number(targetDate);
            const difference = +new Date(toNumber * 1000) - +new Date();
            let timeLeft = initialTimeLeft;

            if(difference > 0) {
                timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return timeLeft;
        };

        intervalRef.current = setInterval(() => {
          const timeLeft = calculateTimeLeft();
          setTimeRemaining(timeLeft);

          if (Object.keys(timeLeft).length === 0) {
            clearInterval(intervalRef.current);
          }
        }, 1000);

        // Cleanup function to clear interval on unmount
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }, [targetDate]); 

    return (
        <div className={`w-full text-center space-y-1 p-2 rounded-md ${timeRemaining.seconds < 60 ? 'bg-red-100 text-red-700' : 'bg-brand-gradient text-white'}`}>
            <div className='flex justify-center items-center gap-2'>
                {timeRemaining.days > 0 && <span>{timeRemaining.days}d </span>}
                {timeRemaining.hours > 0 && <span>{timeRemaining.hours}h </span>}
                {timeRemaining.minutes > 0 && <span>{timeRemaining.minutes}m </span>}
                {timeRemaining.seconds > 0 && <span>{timeRemaining.seconds}s </span>}
            </div>
            {timeRemaining.seconds === 0 && <span>{notification}</span>}
        </div>
    );
}