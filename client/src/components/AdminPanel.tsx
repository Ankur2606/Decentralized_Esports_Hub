import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Rocket, 
  Settings,
  Terminal,
  Copy,
  Coins,
  Video,
  Users,
  ShoppingCart,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";

interface DeploymentStatus {
  deployed: number;
  total: number;
  contracts: {
    predictionMarket?: string;
    fanTokenDAO?: string;
    skillShowcase?: string;
    courseNFT?: string;
    marketplace?: string;
  };
  isComplete: boolean;
}

const contractNames = {
  predictionMarket: "Prediction Market",
  fanTokenDAO: "Fan Token DAO",
  skillShowcase: "Skill Showcase",
  courseNFT: "Course NFT",
  marketplace: "Marketplace"
};

export default function AdminPanel() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState("deploy");
  const [testData, setTestData] = useState({
    eventName: "Team A vs Team B - Valorant Championship",
    tokenAmount: "100",
    coursePrice: "0.1",
    videoTitle: "Pro Valorant Tips"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connected } = useWebSocket();

  const { data: deploymentStatus, isLoading } = useQuery<DeploymentStatus>({
    queryKey: ["/api/admin/deployment-status"],
    refetchInterval: 5000,
  });

  const contracts = [
    { 
      name: "PredictionMarket", 
      description: "Betting and prediction events",
      icon: Coins,
      testFeatures: ["Create betting events", "Resolve outcomes", "Low gas betting (0.001 CHZ)"]
    },
    { 
      name: "FanTokenDAO", 
      description: "Governance and fan tokens",
      icon: Users,
      testFeatures: ["Mint fan tokens", "Create proposals", "Token-weighted voting"]
    },
    { 
      name: "SkillShowcase", 
      description: "Video uploads with CHZ rewards",
      icon: Video,
      testFeatures: ["Upload videos", "Earn 0.01 CHZ per upload", "Video verification"]
    },
    { 
      name: "CourseNFT", 
      description: "Educational NFT marketplace",
      icon: CheckCircle,
      testFeatures: ["Create course NFTs", "0.1 CHZ minimum price", "Royalty system"]
    },
    { 
      name: "Marketplace", 
      description: "General trading platform",
      icon: ShoppingCart,
      testFeatures: ["List any items", "2.5% platform fee", "Instant trading"]
    }
  ];

  const deploymentCommands = [
    "npx thirdweb deploy contracts/PredictionMarket.sol",
    "npx thirdweb deploy contracts/FanTokenDAO.sol",
    "npx thirdweb deploy contracts/SkillShowcase.sol",
    "npx thirdweb deploy contracts/CourseNFT.sol",
    "npx thirdweb deploy contracts/Marketplace.sol"
  ];

  const constructorArgs = {
    PredictionMarket: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]',
    FanTokenDAO: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]',
    SkillShowcase: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]',
    CourseNFT: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]',
    Marketplace: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Command copied successfully",
    });
  };

  const testCreateEvent = async () => {
    try {
      const endTime = Math.floor(Date.now() / 1000) + 3600;
      const response = await fetch("/api/admin/test/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testData.eventName,
          ipfsHash: "QmTestEventHash123",
          endTime
        })
      });

      if (response.ok) {
        toast({
          title: "Test Event Created",
          description: "Users can now place bets on this event",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test event",
        variant: "destructive",
      });
    }
  };

  const testMintTokens = async () => {
    try {
      const response = await fetch("/api/admin/test/mint-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa",
          amount: testData.tokenAmount
        })
      });

      if (response.ok) {
        toast({
          title: "Fan Tokens Minted",
          description: `${testData.tokenAmount} FTK tokens minted successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mint tokens",
        variant: "destructive",
      });
    }
  };

  const progressPercentage = deploymentStatus 
    ? (deploymentStatus.deployed / deploymentStatus.total) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-cyan-400/20">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-white">Loading deployment status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Deploy and manage ChiliZ eSports Hub contracts</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400">
          Admin: 0x0734...47Fa
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-cyan-400/20">
          <TabsTrigger value="deploy">Contract Deployment</TabsTrigger>
          <TabsTrigger value="test">Testing Functions</TabsTrigger>
          <TabsTrigger value="commands">CLI Commands</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Rocket className="h-5 w-5 text-cyan-400" />
                <span>Quick Deployment Guide</span>
              </CardTitle>
              <CardDescription>
                Ready-to-deploy contracts optimized for Chiliz Spicy Testnet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Network Configuration</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Chain ID: 88882</p>
                    <p>• RPC: https://spicy-rpc.chiliz.com/</p>
                    <p>• Explorer: https://spicy.chz.tools/</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Gas Optimization</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Min bet: 0.001 CHZ</p>
                    <p>• Upload reward: 0.01 CHZ</p>
                    <p>• Max gas cost: 0.002 CHZ</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract) => {
              const Icon = contract.icon;
              return (
                <Card key={contract.name} className="bg-slate-800 border-cyan-400/20 hover:border-cyan-400/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Icon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">{contract.name}</CardTitle>
                        <CardDescription className="text-xs">{contract.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {contract.testFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card className="bg-slate-800 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white">Admin Testing Functions</CardTitle>
              <CardDescription>
                Create test content to demonstrate contract functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-white">Create Test Betting Event</Label>
                <Input
                  value={testData.eventName}
                  onChange={(e) => setTestData(prev => ({ ...prev, eventName: e.target.value }))}
                  placeholder="Event name"
                  className="bg-slate-700 border-gray-600 text-white"
                />
                <Button onClick={testCreateEvent} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Coins className="mr-2 h-4 w-4" />
                  Create Test Event
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Mint Fan Tokens</Label>
                <Input
                  value={testData.tokenAmount}
                  onChange={(e) => setTestData(prev => ({ ...prev, tokenAmount: e.target.value }))}
                  placeholder="Token amount"
                  className="bg-slate-700 border-gray-600 text-white"
                />
                <Button onClick={testMintTokens} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Users className="mr-2 h-4 w-4" />
                  Mint FTK Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          <Card className="bg-slate-800 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-cyan-400" />
                <span>Deployment Commands</span>
              </CardTitle>
              <CardDescription>
                Run these commands to deploy contracts using Thirdweb CLI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deploymentCommands.map((command, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-sm">{contracts[index].name}</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(command)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-gray-700">
                    <code className="text-cyan-400 text-sm font-mono">{command}</code>
                  </div>
                  <div className="text-xs text-gray-400">
                    Constructor args: <code className="text-cyan-400">{constructorArgs[contracts[index].name as keyof typeof constructorArgs]}</code>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-yellow-400 font-medium">Deployment Instructions</p>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>1. Run each command in your terminal</p>
                      <p>2. Select "Chiliz Spicy Testnet" when prompted</p>
                      <p>3. Use the provided constructor arguments</p>
                      <p>4. Update contract addresses in your constants file</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open("https://spicy.chz.tools/", "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Open Chiliz Explorer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}