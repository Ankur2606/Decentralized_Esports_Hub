import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Trophy, Play, Book, ShoppingCart, ExternalLink } from "lucide-react";

export default function LiveAdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  
  // Event creation state
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventGame, setEventGame] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  
  // DAO proposal state
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  
  // Course creation state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  
  // Direct backend testing for now
  const createEventMutation = useMutation({
    mutationFn: async () => {
      const endTime = new Date(eventEndTime).getTime() / 1000;
      return apiRequest("/api/admin/test/create-event", "POST", {
        name: eventName,
        description: eventDescription,
        game: eventGame,
        endTime
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event created - check the main page" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEventName("");
      setEventDescription("");
      setEventGame("");
      setEventEndTime("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    }
  });

  // Fund showcase
  const fundShowcaseMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/test/fund-showcase", "POST"),
    onSuccess: () => {
      toast({ title: "Success", description: "Skill Showcase funded with CHZ rewards" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction Failed", 
        description: error.message || "Check MetaMask for transaction",
        variant: "destructive" 
      });
    }
  });

  // Mint test tokens
  const mintTokensMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/test/mint-tokens", "POST", {
      userAddress: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa",
      amount: "1000"
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "1000 Fan Tokens minted to admin address" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction Failed", 
        description: error.message || "Check MetaMask for transaction",
        variant: "destructive" 
      });
    }
  });

  // Create DAO proposal
  const createProposalMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/test/create-proposal", "POST", {
      title: proposalTitle,
      description: proposalDescription
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "DAO proposal created on blockchain" });
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
      setProposalTitle("");
      setProposalDescription("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction Failed", 
        description: error.message || "Check MetaMask for transaction",
        variant: "destructive" 
      });
    }
  });

  // Create test course
  const createCourseMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/test/create-course", "POST", {
      title: courseTitle,
      description: courseDescription,
      price: coursePrice
    }),
    onSuccess: () => {
      toast({ title: "Success", description: "Course NFT created on blockchain" });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseTitle("");
      setCourseDescription("");
      setCoursePrice("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Transaction Failed", 
        description: error.message || "Check MetaMask for transaction",
        variant: "destructive" 
      });
    }
  });

  // Run full test suite
  const runTestSuiteMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/test/run-full-suite", "POST"),
    onSuccess: () => {
      toast({ title: "Success", description: "Full test suite completed - check all sections" });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast({ 
        title: "Test Suite Failed", 
        description: error.message || "Some transactions failed - check MetaMask",
        variant: "destructive" 
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Live Admin Testing Panel</h1>
        <p className="text-muted-foreground">
          Test all deployed contracts with real blockchain transactions
        </p>
        <div className="mt-4 p-4 bg-green-950/50 border border-green-500/50 rounded-lg">
          <p className="text-green-400 font-medium">
            ✅ All 5 contracts deployed on Chiliz Spicy Testnet
          </p>
          <p className="text-sm text-green-300 mt-1">
            Ready for live testing with deployed contracts
          </p>
          <div className="flex items-center gap-2 mt-2">
            <ExternalLink className="h-4 w-4 text-green-300" />
            <a 
              href="https://testnet.chiliscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-300 hover:text-green-200 underline"
            >
              View on Chiliz Explorer
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prediction Market Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Prediction Market
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Team A vs Team B"
              />
            </div>
            <div>
              <Label htmlFor="eventGame">Game</Label>
              <Input
                id="eventGame"
                value={eventGame}
                onChange={(e) => setEventGame(e.target.value)}
                placeholder="Valorant Championship"
              />
            </div>
            <div>
              <Label htmlFor="eventEndTime">End Time</Label>
              <Input
                id="eventEndTime"
                type="datetime-local"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Epic championship match..."
              />
            </div>
            <Button 
              onClick={() => createEventMutation.mutate()}
              disabled={createEventMutation.isPending || !eventName || !eventEndTime}
              className="w-full"
            >
              {createEventMutation.isPending ? "Creating..." : "Create Live Event"}
            </Button>
          </CardContent>
        </Card>

        {/* DAO Governance Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              DAO Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proposalTitle">Proposal Title</Label>
              <Input
                id="proposalTitle"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                placeholder="Increase tournament prizes"
              />
            </div>
            <div>
              <Label htmlFor="proposalDescription">Description</Label>
              <Textarea
                id="proposalDescription"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                placeholder="Proposal details..."
              />
            </div>
            <Button 
              onClick={() => createProposalMutation.mutate()}
              disabled={createProposalMutation.isPending || !proposalTitle}
              className="w-full"
            >
              {createProposalMutation.isPending ? "Creating..." : "Create Proposal"}
            </Button>
            <Button 
              onClick={() => mintTokensMutation.mutate()}
              disabled={mintTokensMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {mintTokensMutation.isPending ? "Minting..." : "Mint 1000 Fan Tokens"}
            </Button>
          </CardContent>
        </Card>

        {/* Skill Showcase Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Skill Showcase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Fund the showcase contract with CHZ for video upload rewards
            </p>
            <Button 
              onClick={() => fundShowcaseMutation.mutate()}
              disabled={fundShowcaseMutation.isPending}
              className="w-full"
            >
              {fundShowcaseMutation.isPending ? "Funding..." : "Fund Showcase (10 CHZ)"}
            </Button>
          </CardContent>
        </Card>

        {/* Course NFT Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Course NFT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Advanced Valorant Tactics"
              />
            </div>
            <div>
              <Label htmlFor="coursePrice">Price (CHZ)</Label>
              <Input
                id="coursePrice"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                placeholder="0.5"
              />
            </div>
            <div>
              <Label htmlFor="courseDescription">Description</Label>
              <Textarea
                id="courseDescription"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Learn pro-level strategies..."
              />
            </div>
            <Button 
              onClick={() => createCourseMutation.mutate()}
              disabled={createCourseMutation.isPending || !courseTitle || !coursePrice}
              className="w-full"
            >
              {createCourseMutation.isPending ? "Creating..." : "Create Course NFT"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Full Test Suite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Complete System Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Execute comprehensive test of all contracts with sample data
          </p>
          <Button 
            onClick={() => runTestSuiteMutation.mutate()}
            disabled={runTestSuiteMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            {runTestSuiteMutation.isPending ? "Running Tests..." : "Run Full Test Suite"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}