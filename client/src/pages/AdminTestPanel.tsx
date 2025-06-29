import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useActiveAccount } from "thirdweb/react";
import { 
  Shield,
  Trophy,
  Video,
  Vote,
  GraduationCap,
  ShoppingCart,
  Zap,
  CheckCircle
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { prepareContractCall, sendTransaction, toWei } from "thirdweb";
import { predictionMarketContract, fanTokenDAOContract, skillShowcaseContract } from "@/lib/contracts";
import { useActiveWallet } from "thirdweb/react";

export default function AdminTestPanel() {
  const { toast } = useToast();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const queryClient = useQueryClient();
  
  // Admin permission check
  const adminAddress = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";
  const isAdmin = account?.address?.toLowerCase() === adminAddress.toLowerCase();

  // Testing state
  const [eventData, setEventData] = useState({
    name: "Valorant Championship Final",
    description: "Team A vs Team B - Grand Final",
    endTime: ""
  });

  const [betData, setBetData] = useState({
    eventId: 1,
    option: 1,
    amount: "10"
  });

  // Test functions with real MetaMask integration
  const createEventMutation = useMutation({
    mutationFn: async (data: typeof eventData) => {
      if (!wallet) throw new Error("Wallet not connected");
      
      const endTime = Math.floor(Date.now() / 1000) + (parseInt(data.endTime) * 3600);
      
      const transaction = prepareContractCall({
        contract: predictionMarketContract,
        method: "createEvent",
        params: [data.name, data.description, BigInt(endTime)]
      });
      
      const result = await sendTransaction({
        transaction,
        account: account!
      });
      
      // Store in backend for UI display
      await apiRequest('/api/admin/test/create-event', 'POST', {
        name: data.name,
        description: data.description,
        endTime: data.endTime,
        txHash: result.transactionHash
      });
      
      return result;
    },
    onSuccess: () => {
      toast({ title: "Event created successfully with MetaMask" });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const placeBetMutation = useMutation({
    mutationFn: async (data: typeof betData) => {
      if (!wallet) throw new Error("Wallet not connected");
      
      // Create transaction with proper error handling
      const transaction = prepareContractCall({
        contract: predictionMarketContract,
        method: "function placeBet(uint256 eventId, uint8 option) payable",
        params: [BigInt(data.eventId), BigInt(data.option)],
        value: toWei(data.amount)
      });
      
      const { transactionHash } = await sendTransaction({
        transaction,
        account: account!
      });
      
      // Store bet in backend
      await apiRequest('/api/bet', 'POST', {
        eventId: data.eventId,
        option: data.option,
        amount: data.amount,
        userAddress: account?.address,
        txHash: transactionHash
      });
      
      return { transactionHash };
    },
    onSuccess: () => {
      toast({ title: "Bet placed with CHZ payment" });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Payment failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const mintTokensMutation = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Wallet not connected");
      
      const transaction = prepareContractCall({
        contract: fanTokenDAOContract,
        method: "mint",
        params: [account!.address, toWei("100")]
      });
      
      const result = await sendTransaction({
        transaction,
        account: account!
      });
      
      return result;
    },
    onSuccess: () => {
      toast({ title: "100 Fan tokens minted via MetaMask" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Minting transaction failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const fundSkillShowcaseMutation = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Wallet not connected");
      
      const transaction = prepareContractCall({
        contract: skillShowcaseContract,
        method: "fundRewards",
        params: [],
        value: toWei("10") // Fund with 10 CHZ
      });
      
      const result = await sendTransaction({
        transaction,
        account: account!
      });
      
      return result;
    },
    onSuccess: () => {
      toast({ title: "Skill showcase funded with 10 CHZ" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Funding transaction failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-400 mb-2">Wallet Connection Required</h3>
              <p className="text-gray-400">Connect your MetaMask wallet to access admin testing panel</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-400 mb-2">Admin Access Required</h3>
              <p className="text-gray-400 mb-2">Connected: {account.address}</p>
              <p className="text-gray-400">Only admin address can access testing functions</p>
              <Badge variant="outline" className="mt-2">Admin: {adminAddress}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Admin Testing Panel
        </h1>
        <p className="text-gray-400">Real blockchain interactions with MetaMask integration</p>
        <Badge className="mt-2 bg-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          Admin Access Granted
        </Badge>
      </div>

      {/* Contract Status */}
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live Contracts Status
          </CardTitle>
          <CardDescription>All contracts deployed and ready for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Prediction Market", address: "0xb618...2E64", icon: Trophy },
              { name: "Fan Token DAO", address: "0x3E50...E4B9", icon: Vote },
              { name: "Skill Showcase", address: "0x0BC8...87C2", icon: Video },
              { name: "Course NFT", address: "0x493E...62CF", icon: GraduationCap },
              { name: "Marketplace", address: "0xEc2F...0467", icon: ShoppingCart }
            ].map((contract) => (
              <div key={contract.name} className="flex items-center gap-3 p-3 bg-green-900/10 rounded-lg border border-green-500/20">
                <contract.icon className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-medium text-green-300">{contract.name}</div>
                  <div className="text-xs text-gray-400">{contract.address}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testing Functions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create Event */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Create Prediction Event
            </CardTitle>
            <CardDescription>Test event creation with real CHZ transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventData.name}
                onChange={(e) => setEventData({...eventData, name: e.target.value})}
                placeholder="Enter event name"
              />
            </div>
            <div>
              <Label htmlFor="eventDescription">Description</Label>
              <Input
                id="eventDescription"
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
                placeholder="Event description"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time (hours from now)</Label>
              <Input
                id="endTime"
                type="number"
                value={eventData.endTime}
                onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
                placeholder="24"
              />
            </div>
            <Button 
              onClick={() => createEventMutation.mutate(eventData)}
              disabled={createEventMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event (MetaMask)"}
            </Button>
          </CardContent>
        </Card>

        {/* Place Bet */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Place Test Bet
            </CardTitle>
            <CardDescription>Test betting with real CHZ payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="betEventId">Event ID</Label>
              <Input
                id="betEventId"
                type="number"
                value={betData.eventId}
                onChange={(e) => setBetData({...betData, eventId: parseInt(e.target.value)})}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="betOption">Option (1 or 2)</Label>
              <Input
                id="betOption"
                type="number"
                value={betData.option}
                onChange={(e) => setBetData({...betData, option: parseInt(e.target.value)})}
                placeholder="1"
                min="1"
                max="2"
              />
            </div>
            <div>
              <Label htmlFor="betAmount">Amount (CHZ)</Label>
              <Input
                id="betAmount"
                value={betData.amount}
                onChange={(e) => setBetData({...betData, amount: e.target.value})}
                placeholder="10"
              />
            </div>
            <Button 
              onClick={() => placeBetMutation.mutate(betData)}
              disabled={placeBetMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {placeBetMutation.isPending ? "Placing..." : "Place Bet (MetaMask)"}
            </Button>
          </CardContent>
        </Card>

        {/* Mint Tokens */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Mint Fan Tokens
            </CardTitle>
            <CardDescription>Mint governance tokens for DAO testing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => mintTokensMutation.mutate()}
              disabled={mintTokensMutation.isPending}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {mintTokensMutation.isPending ? "Minting..." : "Mint 100 Fan Tokens (MetaMask)"}
            </Button>
          </CardContent>
        </Card>

        {/* Fund Showcase */}
        <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Video className="h-5 w-5" />
              Fund Skill Showcase
            </CardTitle>
            <CardDescription>Add CHZ rewards for video uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => fundSkillShowcaseMutation.mutate()}
              disabled={fundSkillShowcaseMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {fundSkillShowcaseMutation.isPending ? "Funding..." : "Fund Showcase (MetaMask)"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-gray-300">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-400">
          <p>• All buttons will trigger MetaMask popups for real CHZ transactions</p>
          <p>• Make sure you have CHZ in your wallet for testing</p>
          <p>• Events created will appear on Thirdweb dashboard and Chiliz explorer</p>
          <p>• Each transaction requires gas fees on Chiliz Spicy Testnet</p>
          <p>• Test bet payments will be deducted from your wallet balance</p>
        </CardContent>
      </Card>
    </div>
  );
}