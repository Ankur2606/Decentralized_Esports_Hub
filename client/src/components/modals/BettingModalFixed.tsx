import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { prepareContractCall, sendTransaction, toWei } from "thirdweb";
import { predictionMarketContract } from "@/lib/contracts";
import { apiRequest } from "@/lib/queryClient";
import { Dice1, TrendingUp, Wallet } from "lucide-react";

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

interface BettingModalProps {
  open: boolean;
  onClose: () => void;
  event: PredictionEvent;
  odds: {
    team1: { name: string; odds: number };
    team2: { name: string; odds: number };
  };
}

export default function BettingModalFixed({ open, onClose, event, odds }: BettingModalProps) {
  const [selectedOption, setSelectedOption] = useState<0 | 1 | null>(null);
  const [betAmount, setBetAmount] = useState("0.01"); // Set minimum bet amount
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  const placeBetMutation = useMutation({
    mutationFn: async ({ eventId, option, amount }: { 
      eventId: number; 
      option: number; 
      amount: string; 
    }) => {
      if (!wallet || !account) {
        throw new Error("Please connect your MetaMask wallet first");
      }

      // Validate minimum bet amount (0.001 CHZ)
      const betValue = parseFloat(amount);
      if (betValue < 0.001) {
        throw new Error("Minimum bet is 0.001 CHZ");
      }

      // Use event ID 1 for testing (first contract event)
      const contractEventId = 1;

      // Prepare smart contract transaction with correct parameters
      const transaction = prepareContractCall({
        contract: predictionMarketContract,
        method: "placeBet",
        params: [BigInt(contractEventId), BigInt(option)], // Use fixed event ID 1 and 0-based option
        value: toWei(amount)
      });

      // Send transaction via MetaMask
      const result = await sendTransaction({
        transaction,
        account: account
      });

      // Store bet data in backend
      await apiRequest('/api/bet', 'POST', {
        eventId: contractEventId,
        userAddress: account.address,
        option: option,
        amount,
        txHash: result.transactionHash
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Bet Placed Successfully!",
        description: "Your CHZ payment has been processed on the blockchain.",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Please check your wallet connection and try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedOption(null);
    setBetAmount("0.01");
  };

  const handlePlaceBet = () => {
    if (selectedOption === null) {
      toast({
        title: "Select an option",
        description: "Please choose Team A or Team B before placing your bet.",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({
      eventId: event.id,
      option: selectedOption,
      amount: betAmount,
    });
  };

  const potentialPayout = selectedOption !== null 
    ? (parseFloat(betAmount) * (selectedOption === 0 ? odds.team1.odds : odds.team2.odds)).toFixed(3)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-dark-bg border-purple-accent/20 text-light-text max-w-md">
        <DialogHeader>
          <DialogTitle className="gaming-gradient-text text-xl font-bold">
            Place Bet
          </DialogTitle>
          <p className="text-sm text-gray-400">
            {event.name}
          </p>
          <p className="text-xs text-gray-500">
            Team A vs Team B - Grand Final
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Selection */}
          <div>
            <Label className="text-light-text font-medium mb-3 block">Choose Team</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedOption === 0 ? "default" : "outline"}
                className={`p-4 h-auto border transition-all ${
                  selectedOption === 0
                    ? "bg-cyan-accent text-dark-bg border-cyan-accent"
                    : "border-cyan-accent/50 bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-accent"
                }`}
                onClick={() => setSelectedOption(0)}
              >
                <div className="text-center w-full">
                  <p className="font-bold text-sm">
                    Valorant Championship Final
                  </p>
                  <p className="text-lg font-bold">
                    {odds.team1.odds}x
                  </p>
                </div>
              </Button>

              <Button
                variant={selectedOption === 1 ? "default" : "outline"}
                className={`p-4 h-auto border transition-all ${
                  selectedOption === 1
                    ? "bg-pink-500 text-white border-pink-500"
                    : "border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400"
                }`}
                onClick={() => setSelectedOption(1)}
              >
                <div className="text-center w-full">
                  <p className="font-bold text-sm">
                    Team B
                  </p>
                  <p className="text-lg font-bold">
                    {odds.team2.odds}x
                  </p>
                </div>
              </Button>
            </div>
          </div>

          {/* Bet Amount */}
          <div>
            <Label htmlFor="amount" className="text-light-text font-medium">
              Bet Amount (CHZ)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0.001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="mt-2 bg-dark-surface border-purple-accent/30 text-light-text"
              placeholder="0.001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum bet: 0.001 CHZ
            </p>
          </div>

          {/* Betting Summary */}
          <Card className="bg-dark-surface border-purple-accent/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-accent" />
              <span className="font-medium text-light-text">Bet Summary</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Bet Amount:</span>
                <span className="text-cyan-accent font-bold">{betAmount} CHZ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Payout:</span>
                <span className="text-pink-400 font-bold">{potentialPayout} CHZ</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceBet}
              disabled={placeBetMutation.isPending || selectedOption === null}
              className="flex-1 gaming-gradient text-white font-bold hover:opacity-90"
            >
              {placeBetMutation.isPending ? (
                <>
                  <Dice1 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Place Bet (MetaMask)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}