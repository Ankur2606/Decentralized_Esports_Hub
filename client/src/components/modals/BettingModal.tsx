import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { prepareContractCall, sendTransaction, toWei } from "thirdweb";
import { Dice1, TrendingUp, Wallet } from "lucide-react";

interface PredictionEvent {
  id: number;
  name: string;
  description: string;
  game: string;
  endTime: string;
  totalPool: string;
  betCount: number;
  resolved: boolean;
}

interface BettingModalProps {
  open: boolean;
  onClose: () => void;
  event: PredictionEvent;
  odds: {
    team1: { name: string; odds: number };
    team2: { name: string; odds: number };
  };
}

export default function BettingModal({ open, onClose, event, odds }: BettingModalProps) {
  const [selectedOption, setSelectedOption] = useState<0 | 1 | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, userAddress, account, connectWallet, getContracts } = useWeb3();

  const placeBetMutation = useMutation({
    mutationFn: async ({ eventId, option, amount }: { 
      eventId: number; 
      option: number; 
      amount: string; 
    }) => {
      const response = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          userAddress: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", // Mock address
          option,
          amount,
          odds: option === 0 ? odds.team1.odds.toString() : odds.team2.odds.toString()
        }),
      });
      if (!response.ok) throw new Error("Failed to place bet");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Bet Placed!",
        description: "Your bet has been placed successfully on the blockchain.",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedOption(null);
    setBetAmount("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const calculatePayout = () => {
    if (!selectedOption && selectedOption !== 0) return 0;
    if (!betAmount || isNaN(parseFloat(betAmount))) return 0;
    
    const selectedOdds = selectedOption === 0 ? odds.team1.odds : odds.team2.odds;
    return parseFloat(betAmount) * selectedOdds;
  };

  const handlePlaceBet = () => {
    if (selectedOption === null || !betAmount) {
      toast({
        title: "Invalid Input",
        description: "Please select a team and enter a bet amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(betAmount);
    if (amount < 0.001) {
      toast({
        title: "Minimum Bet",
        description: "Minimum bet amount is 0.001 CHZ.",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({
      eventId: event.id,
      option: selectedOption,
      amount: betAmount
    });
  };

  const payout = calculatePayout();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-dark-bg border-cyan-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Place Bet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <Card className="p-4 bg-card-gradient border-cyan-accent/20">
            <h4 className="font-bold mb-2 text-light-text">{event.name}</h4>
            <p className="text-sm text-gray-400">{event.description}</p>
            <div className="mt-2">
              <span className="gaming-gradient px-2 py-1 rounded text-xs font-bold">
                {event.game}
              </span>
            </div>
          </Card>

          {/* Team Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Choose Winner</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className={`p-4 h-auto border-2 transition-all ${
                  selectedOption === 0 
                    ? "border-cyan-accent bg-cyan-accent/20" 
                    : "border-cyan-accent/50 hover:border-cyan-accent"
                }`}
                onClick={() => setSelectedOption(0)}
              >
                <div className="text-center w-full">
                  <p className="font-bold text-cyan-accent text-sm">
                    {odds.team1.name}
                  </p>
                  <p className="text-2xl font-bold text-cyan-accent">
                    {odds.team1.odds}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className={`p-4 h-auto border-2 transition-all ${
                  selectedOption === 1 
                    ? "border-pink-400 bg-pink-400/20" 
                    : "border-pink-400/50 hover:border-pink-400"
                }`}
                onClick={() => setSelectedOption(1)}
              >
                <div className="text-center w-full">
                  <p className="font-bold text-pink-400 text-sm">
                    {odds.team2.name}
                  </p>
                  <p className="text-2xl font-bold text-pink-400">
                    {odds.team2.odds}
                  </p>
                </div>
              </Button>
            </div>
          </div>

          {/* Bet Amount */}
          <div>
            <Label htmlFor="betAmount" className="text-sm font-medium mb-2 block">
              Bet Amount (CHZ)
            </Label>
            <Input
              id="betAmount"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-cyan-accent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum bet: 0.001 CHZ
            </p>
          </div>

          {/* Potential Payout */}
          <Card className="p-4 bg-cyan-accent/10 border-cyan-accent/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Potential Payout:</span>
              <span className="font-bold text-cyan-accent text-lg">
                {payout > 0 ? `${payout.toFixed(3)} CHZ` : "-- CHZ"}
              </span>
            </div>
            {payout > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Bet Amount:</span>
                  <span>{betAmount} CHZ</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Profit:</span>
                  <span className="text-success-green">
                    +{(payout - parseFloat(betAmount || "0")).toFixed(3)} CHZ
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handlePlaceBet}
            disabled={placeBetMutation.isPending || selectedOption === null || !betAmount}
            className="w-full gaming-gradient hover:neon-cyan card-hover"
          >
            <Dice1 className="mr-2 h-4 w-4" />
            {placeBetMutation.isPending ? "Placing Bet..." : "Place Bet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
