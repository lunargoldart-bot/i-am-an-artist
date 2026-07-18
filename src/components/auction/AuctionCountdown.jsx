import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function AuctionCountdown({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return setTimeLeft({ ended: true });
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, ended: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;

  if (timeLeft.ended) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
        <Clock className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm font-semibold">Auction Ended</span>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  return (
    <div className={`rounded-lg border px-4 py-3 ${isUrgent ? "bg-red-500/10 border-red-500/30" : "bg-gold/10 border-gold/30"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`w-4 h-4 ${isUrgent ? "text-red-400" : "text-gold"}`} />
        <span className={`text-xs font-semibold ${isUrgent ? "text-red-400" : "text-gold"}`}>
          {isUrgent ? "⚡ Ending Soon!" : "Auction Ends In"}
        </span>
      </div>
      <div className="flex gap-3">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <p className={`text-xl font-playfair font-bold ${isUrgent ? "text-red-400" : "text-foreground"}`}>{timeLeft.days}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        )}
        <div className="text-center">
          <p className={`text-xl font-playfair font-bold ${isUrgent ? "text-red-400" : "text-foreground"}`}>{String(timeLeft.hours).padStart(2, "0")}</p>
          <p className="text-xs text-muted-foreground">hrs</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-playfair font-bold ${isUrgent ? "text-red-400" : "text-foreground"}`}>{String(timeLeft.minutes).padStart(2, "0")}</p>
          <p className="text-xs text-muted-foreground">min</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-playfair font-bold ${isUrgent ? "text-red-400" : "text-foreground"}`}>{String(timeLeft.seconds).padStart(2, "0")}</p>
          <p className="text-xs text-muted-foreground">sec</p>
        </div>
      </div>
    </div>
  );
}