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

export default function BettingModal({ open, onClose, event, odds }: BettingModalProps) {
  const [selectedOption, setSelectedOption] = useState<0 | 1 | null>(null);
  const [betAmount, setBetAmount] = useState("");
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

      // Use contract event ID instead of database ID
      const contractEventId = event.contractEventId || eventId;
      
      // Prepare smart contract transaction using correct method signature
      const transaction = prepareContractCall({
        contract: predictionMarketContract,
        method: "function placeBet(uint256 eventId, uint8 option) payable",
        params: [BigInt(contractEventId), BigInt(option + 1)],
        value: toWei(amount)
      });

      // Send transaction via MetaMask
      const { transactionHash } = await sendTransaction({
        transaction,
        account: account
      });

      // Store bet data in backend
      await apiRequest('/api/bet', 'POST', {
        eventId: eventId, // Use database ID for backend storage
        contractEventId: contractEventId, // Also send contract ID for reference
        userAddress: account.address,
        option: option + 1,
        amount,
        txHash: transactionHash
      });
      
      return { transactionHash };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Bet Placed with CHZ Payment!",
        description: "Your bet has been placed successfully on the blockchain.",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Please connect your wallet and try again.",
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
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your MetaMask wallet to place bets.",
        variant: "destructive",
      });
      return;
    }

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
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
            <p className="text-gray-400 text-sm">{event.description}</p>
          </div>

          {!account ? (
            <div className="text-center p-6 space-y-4">
              <Wallet className="h-12 w-12 mx-auto text-orange-400" />
              <p className="text-orange-400">Connect MetaMask to place bets with CHZ</p>
            </div>
          ) : (
            <>
              {/* Team Selection */}
              <div className="space-y-3">
                <Label className="text-cyan-accent">Choose Team</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      selectedOption === 0 
                        ? 'border-cyan-accent bg-cyan-accent/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedOption(0)}
                  >
                    <div className="text-center">
                      <p className="font-medium text-white">{odds.team1.name}</p>
                      <p className="text-sm text-cyan-accent">{odds.team1.odds.toFixed(2)}x</p>
                    </div>
                  </Card>
                  <Card 
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      selectedOption === 1 
                        ? 'border-cyan-accent bg-cyan-accent/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedOption(1)}
                  >
                    <div className="text-center">
                      <p className="font-medium text-white">{odds.team2.name}</p>
                      <p className="text-sm text-cyan-accent">{odds.team2.odds.toFixed(2)}x</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Bet Amount */}
              <div className="space-y-2">
                <Label htmlFor="betAmount" className="text-cyan-accent">Bet Amount (CHZ)</Label>
                <Input
                  id="betAmount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter CHZ amount"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {/* Payout Display */}
              {payout > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bet Amount:</span>
                    <span className="text-white">{betAmount} CHZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Payout:</span>
                    <span className="text-cyan-accent font-semibold">{payout.toFixed(3)} CHZ</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePlaceBet}
                  disabled={placeBetMutation.isPending || selectedOption === null || !betAmount}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  {placeBetMutation.isPending ? "Processing..." : "Place Bet (MetaMask)"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}