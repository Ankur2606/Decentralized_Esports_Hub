import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BettingModalFixed from "@/components/modals/BettingModalFixed";
import { Clock, Users, DollarSign, Trophy } from "lucide-react";

interface PredictionEvent {
  id: number;
  contractEventId: number;
  name: string;
  description: string;
  game: string;
  endTime: string;
  totalPool: string;
  betCount: number;
  resolved: boolean;
}

interface BettingCardProps {
  event: PredictionEvent;
}

export default function BettingCard({ event }: BettingCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const getTimeRemaining = () => {
    const endTime = new Date(event.endTime);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusBadge = () => {
    if (event.resolved) {
      return <Badge className="bg-cyan-accent text-dark-bg">RESOLVED</Badge>;
    }
    
    const timeRemaining = getTimeRemaining();
    if (timeRemaining === "Ended") {
      return <Badge className="bg-warning-gold text-dark-bg">ENDED</Badge>;
    }
    
    const endTime = new Date(event.endTime);
    const now = new Date();
    const hoursLeft = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 1) {
      return <Badge className="bg-error-red text-white live-indicator">LIVE</Badge>;
    }
    
    return <Badge className="bg-success-green text-white">{timeRemaining}</Badge>;
  };

  const mockOdds = {
    team1: { name: event.name.split(' vs ')[0] || "Team A", odds: 1.85 },
    team2: { name: event.name.split(' vs ')[1] || "Team B", odds: 2.15 }
  };

  return (
    <>
      <div className="gradient-border card-hover">
        <Card className="gradient-border-content p-0 bg-transparent border-none">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Badge className="gaming-gradient text-white">
                {event.game}
              </Badge>
              {getStatusBadge()}
            </div>

            {/* Event Info */}
            <h3 className="text-lg font-bold mb-2 text-light-text">
              {event.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>

            {/* Betting Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                className="p-4 h-auto border-cyan-accent/50 bg-cyan-accent/10 hover:bg-cyan-accent/20 hover:border-cyan-accent"
                onClick={() => !event.resolved && setModalOpen(true)}
                disabled={event.resolved}
              >
                <div className="text-center w-full">
                  <p className="font-bold text-cyan-accent text-sm">
                    {mockOdds.team1.name}
                  </p>
                  <p className="text-xl font-bold text-cyan-accent">
                    {mockOdds.team1.odds}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20 hover:border-pink-500"
                onClick={() => !event.resolved && setModalOpen(true)}
                disabled={event.resolved}
              >
                <div className="text-center w-full">
                  <p className="font-bold text-pink-400 text-sm">
                    {mockOdds.team2.name}
                  </p>
                  <p className="text-xl font-bold text-pink-400">
                    {mockOdds.team2.odds}
                  </p>
                </div>
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Pool: {parseFloat(event.totalPool).toFixed(1)} CHZ</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{event.betCount} Bets</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!event.resolved && (
              <Button
                onClick={() => setModalOpen(true)}
                className="w-full mt-4 gaming-gradient hover:neon-cyan"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Place Bet
              </Button>
            )}
          </div>
        </Card>
      </div>

      <BettingModalFixed
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={event}
        odds={mockOdds}
      />
    </>
  );
}
