import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BettingCard from "@/components/BettingCard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Clock, TrendingUp, Users, DollarSign } from "lucide-react";

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

interface RecentActivity {
  type: string;
  user: string;
  action: string;
  amount: string;
  timestamp: Date;
}

export default function Home() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const { lastMessage } = useWebSocket();

  const { data: events, isLoading } = useQuery<PredictionEvent[]>({
    queryKey: ["/api/events"],
  });

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.event === "bet:placed") {
      const newActivity: RecentActivity = {
        type: "bet",
        user: lastMessage.data.bettor,
        action: `placed bet on Event #${lastMessage.data.eventId}`,
        amount: `${lastMessage.data.amount} CHZ`,
        timestamp: new Date()
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }
  }, [lastMessage]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded loading-shimmer" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded loading-shimmer" />
          </div>
          <div className="h-16 w-32 bg-muted animate-pulse rounded loading-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-xl loading-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const totalVolume = events?.reduce((sum, event) => 
    sum + parseFloat(event.totalPool || "0"), 0
  ) || 0;

  const liveEvents = events?.filter(event => !event.resolved) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold glow-text">Live Predictions</h1>
          <div className="flex items-center space-x-2 bg-success-green/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-success-green rounded-full live-indicator" />
            <span className="text-success-green text-sm font-medium">LIVE</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Total Volume Today</p>
          <p className="text-2xl font-bold text-cyan-accent">
            {totalVolume.toFixed(2)} CHZ
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Events</p>
              <p className="text-2xl font-bold text-cyan-accent">{liveEvents.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Pool</p>
              <p className="text-2xl font-bold text-success-green">
                {totalVolume.toFixed(2)} CHZ
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Bets</p>
              <p className="text-2xl font-bold text-warning-gold">
                {events?.reduce((sum, event) => sum + event.betCount, 0) || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ending Soon</p>
              <p className="text-2xl font-bold text-error-red">
                {liveEvents.filter(event => {
                  const endTime = new Date(event.endTime);
                  const now = new Date();
                  const hoursLeft = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                  return hoursLeft < 2;
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Betting Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <BettingCard key={event.id} event={event} />
        ))}
      </div>

      {/* Recent Activity Feed */}
      <Card className="p-6 bg-card-gradient border-cyan-accent/20">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-cyan-accent" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No recent activity. Start betting to see live updates!</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {activity.user.slice(0, 6)}...{activity.user.slice(-4)} {activity.action}
                    </p>
                    <p className="text-sm text-gray-400">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="text-success-green font-bold">
                  {activity.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
