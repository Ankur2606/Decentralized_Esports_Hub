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
  ExternalLink,
  BookOpen,
  GraduationCap,
  Activity
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
    videoTitle: "Pro Valorant Tips",
    courseTitle: "Valorant Pro Strategies",
    itemName: "Rare Weapon Skin"
  });
  
  const [contractAddresses, setContractAddresses] = useState({
    predictionMarket: "",
    fanTokenDAO: "",
    skillShowcase: "",
    courseNFT: "",
    marketplace: ""
  });
  const [testResults, setTestResults] = useState<Array<{
    action: string;
    message: string;
    success: boolean;
    timestamp: string;
    txHash?: string;
  }>>([]);
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

      const result = await response.json();
      addTestResult("Mint Fan Tokens", result.success, result.message, result.txHash);

      if (response.ok) {
        toast({
          title: "Fan Tokens Minted",
          description: `${testData.tokenAmount} FTK tokens minted successfully`,
        });
      }
    } catch (error) {
      addTestResult("Mint Fan Tokens", false, "Failed to mint tokens");
      toast({
        title: "Error",
        description: "Failed to mint tokens",
        variant: "destructive",
      });
    }
  };

  const testUploadVideo = async () => {
    try {
      const response = await fetch("/api/admin/test/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: testData.videoTitle,
          creator: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"
        })
      });

      const result = await response.json();
      addTestResult("Upload Video", result.success, result.message, result.txHash);

      if (response.ok) {
        toast({
          title: "Video Uploaded",
          description: `Earned 0.01 CHZ reward for video upload`,
        });
      }
    } catch (error) {
      addTestResult("Upload Video", false, "Failed to upload video");
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    }
  };

  const testCreateCourse = async () => {
    try {
      const response = await fetch("/api/admin/test/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: testData.courseTitle,
          price: testData.coursePrice,
          creator: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"
        })
      });

      const result = await response.json();
      addTestResult("Create Course NFT", result.success, result.message, result.txHash);

      if (response.ok) {
        toast({
          title: "Course NFT Created",
          description: `Course "${testData.courseTitle}" minted as NFT`,
        });
      }
    } catch (error) {
      addTestResult("Create Course NFT", false, "Failed to create course");
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const testListItem = async () => {
    try {
      const response = await fetch("/api/admin/test/list-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testData.itemName,
          price: "0.05",
          seller: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"
        })
      });

      const result = await response.json();
      addTestResult("List Marketplace Item", result.success, result.message, result.txHash);

      if (response.ok) {
        toast({
          title: "Item Listed",
          description: `"${testData.itemName}" listed on marketplace`,
        });
      }
    } catch (error) {
      addTestResult("List Marketplace Item", false, "Failed to list item");
      toast({
        title: "Error",
        description: "Failed to list item",
        variant: "destructive",
      });
    }
  };

  const updateContractAddresses = async () => {
    try {
      const response = await fetch("/api/admin/update-contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contracts: contractAddresses })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contracts Updated",
          description: "System now using live blockchain interactions",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/deployment-status"] });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update contract addresses",
        variant: "destructive",
      });
    }
  };

  const addTestResult = (action: string, success: boolean, message: string, txHash?: string) => {
    const newResult = {
      action,
      success,
      message,
      txHash,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
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
                <span>MetaMask Deployment Guide</span>
              </CardTitle>
              <CardDescription>
                Browser-based deployment with MetaMask integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Deployment Process:</h4>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Run deployment command in terminal</li>
                  <li>Browser opens with Thirdweb interface</li>
                  <li>Select "Chiliz Spicy Testnet" network</li>
                  <li>Enter constructor arguments</li>
                  <li>Click "Deploy Now" button</li>
                  <li>Approve transaction in MetaMask</li>
                  <li>Copy contract address from success page</li>
                </ol>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Network Settings</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Chain ID: 88882</p>
                    <p>• RPC: https://spicy-rpc.chiliz.com/</p>
                    <p>• Admin: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Gas Costs</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Deployment: ~0.001-0.003 CHZ</p>
                    <p>• Min bet: 0.001 CHZ</p>
                    <p>• Upload reward: 0.01 CHZ</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Deployment Commands */}
            <Card className="bg-slate-800 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-cyan-400" />
                  <span>Deployment Commands</span>
                </CardTitle>
                <CardDescription>
                  Run these commands one by one. Each opens MetaMask for deployment approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "PredictionMarket",
                    command: 'npx thirdweb deploy contracts/PredictionMarketSimple.sol -k "$THIRDWEB_SECRET_KEY"',
                    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
                  },
                  {
                    name: "FanTokenDAO",
                    command: 'npx thirdweb deploy contracts/FanTokenDAOSimple.sol -k "$THIRDWEB_SECRET_KEY"',
                    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]'
                  },
                  {
                    name: "SkillShowcase",
                    command: 'npx thirdweb deploy contracts/SkillShowcaseSimple.sol -k "$THIRDWEB_SECRET_KEY"',
                    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
                  },
                  {
                    name: "CourseNFT",
                    command: 'npx thirdweb deploy contracts/CourseNFTSimple.sol -k "$THIRDWEB_SECRET_KEY"',
                    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]'
                  },
                  {
                    name: "Marketplace",
                    command: 'npx thirdweb deploy contracts/MarketplaceSimple.sol -k "$THIRDWEB_SECRET_KEY"',
                    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
                  }
                ].map((contract, index) => (
                  <div key={contract.name} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{index + 1}. {contract.name}</h4>
                      <Button
                        onClick={() => copyToClipboard(contract.command)}
                        size="sm"
                        variant="ghost"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-gray-400 text-xs">Terminal Command:</Label>
                        <code className="block bg-black/30 p-2 rounded text-xs text-green-400 font-mono">
                          {contract.command}
                        </code>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs">Constructor Arguments (paste in browser):</Label>
                        <code className="block bg-black/30 p-2 rounded text-xs text-yellow-400 font-mono">
                          {contract.args}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contract Address Input */}
            <Card className="bg-slate-800 border-green-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-400" />
                  <span>Update Contract Addresses</span>
                </CardTitle>
                <CardDescription>
                  After deployment, paste all 5 contract addresses here to enable live blockchain interactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  predictionMarket: "Prediction Market",
                  fanTokenDAO: "Fan Token DAO", 
                  skillShowcase: "Skill Showcase",
                  courseNFT: "Course NFT",
                  marketplace: "Marketplace"
                }).map(([key, name]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-white">{name} Address</Label>
                    <Input
                      placeholder="0x..."
                      value={contractAddresses[key as keyof typeof contractAddresses]}
                      onChange={(e) => setContractAddresses(prev => ({ 
                        ...prev, 
                        [key]: e.target.value 
                      }))}
                      className="bg-slate-700 border-gray-600 text-white font-mono text-sm"
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-600">
                  <Button 
                    onClick={updateContractAddresses}
                    disabled={!Object.values(contractAddresses).every(addr => addr.length === 42)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    {Object.values(contractAddresses).every(addr => addr.length === 42) 
                      ? "Update All Addresses & Enable Live Contracts" 
                      : "Enter All 5 Contract Addresses"
                    }
                  </Button>
                  
                  {deploymentStatus?.isComplete && (
                    <div className="mt-3 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 text-sm flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>All contracts deployed! System will switch from mock to live blockchain interactions.</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          {/* Contract Significance Guide */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                <span>Contract Guide & Testing</span>
              </CardTitle>
              <CardDescription>
                Understanding your eSports ecosystem contracts and how to test them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PredictionMarket */}
                <Card className="bg-slate-800 border-purple-400/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Coins className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">PredictionMarket</CardTitle>
                        <CardDescription className="text-xs">eSports Betting & Predictions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-gray-300">
                      <p><strong>Purpose:</strong> Create prediction markets for eSports matches</p>
                      <p><strong>Features:</strong> Event creation, betting, winnings distribution</p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Event: Valorant Championship Final"
                        value={testData.eventName}
                        onChange={(e) => setTestData(prev => ({ ...prev, eventName: e.target.value }))}
                        className="bg-slate-700 border-gray-600 text-white text-xs"
                      />
                      <Button onClick={testCreateEvent} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        Create Betting Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* FanTokenDAO */}
                <Card className="bg-slate-800 border-blue-400/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">FanTokenDAO</CardTitle>
                        <CardDescription className="text-xs">Community Governance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-gray-300">
                      <p><strong>Purpose:</strong> Fan token distribution and DAO voting</p>
                      <p><strong>Features:</strong> Token minting, proposals, voting power</p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Token amount (e.g., 100)"
                        value={testData.tokenAmount}
                        onChange={(e) => setTestData(prev => ({ ...prev, tokenAmount: e.target.value }))}
                        className="bg-slate-700 border-gray-600 text-white text-xs"
                      />
                      <Button onClick={testMintTokens} size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Mint Fan Tokens
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* SkillShowcase */}
                <Card className="bg-slate-800 border-green-400/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Video className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">SkillShowcase</CardTitle>
                        <CardDescription className="text-xs">Gaming Video Platform</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-gray-300">
                      <p><strong>Purpose:</strong> Upload gaming clips and earn CHZ rewards</p>
                      <p><strong>Features:</strong> Video uploads, likes, 0.01 CHZ per upload</p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Video title: Epic Clutch Play"
                        value={testData.videoTitle}
                        onChange={(e) => setTestData(prev => ({ ...prev, videoTitle: e.target.value }))}
                        className="bg-slate-700 border-gray-600 text-white text-xs"
                      />
                      <Button onClick={testUploadVideo} size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        Upload Test Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* CourseNFT */}
                <Card className="bg-slate-800 border-yellow-400/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <GraduationCap className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">CourseNFT</CardTitle>
                        <CardDescription className="text-xs">Gaming Education NFTs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-gray-300">
                      <p><strong>Purpose:</strong> Create and sell gaming tutorial NFTs</p>
                      <p><strong>Features:</strong> Course minting, purchasing, skill development</p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Course: Valorant Pro Strategies"
                        value={testData.courseTitle}
                        onChange={(e) => setTestData(prev => ({ ...prev, courseTitle: e.target.value }))}
                        className="bg-slate-700 border-gray-600 text-white text-xs"
                      />
                      <Button onClick={testCreateCourse} size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                        Create Course NFT
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Marketplace */}
                <Card className="bg-slate-800 border-cyan-400/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <ShoppingCart className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">Marketplace</CardTitle>
                        <CardDescription className="text-xs">NFT Trading Platform</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-gray-300">
                      <p><strong>Purpose:</strong> Trade virtual items and gaming NFTs</p>
                      <p><strong>Features:</strong> Item listing, purchasing, marketplace fees</p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Item: Rare Weapon Skin"
                        value={testData.itemName}
                        onChange={(e) => setTestData(prev => ({ ...prev, itemName: e.target.value }))}
                        className="bg-slate-700 border-gray-600 text-white text-xs"
                      />
                      <Button onClick={testListItem} size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700">
                        List Test Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Testing Results */}
          <Card className="bg-slate-800 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                <span>Testing Results</span>
              </CardTitle>
              <CardDescription>
                Live contract interaction results and transaction status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border text-sm ${
                    result.success 
                      ? 'bg-green-500/10 border-green-400/20 text-green-400'
                      : 'bg-red-500/10 border-red-400/20 text-red-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.action}</span>
                      <span className="text-xs">{result.timestamp}</span>
                    </div>
                    <p className="text-xs mt-1">{result.message}</p>
                    {result.txHash && (
                      <a 
                        href={`https://testnet.chiliscan.com/tx/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 text-xs underline"
                      >
                        View Transaction
                      </a>
                    )}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No tests run yet. Use the testing functions above to interact with your contracts.
                  </p>
                )}
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