import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Video, 
  Users, 
  GraduationCap, 
  ShoppingCart, 
  TrendingUp,
  Zap,
  Target,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowRight,
  Coins,
  ExternalLink
} from "lucide-react";
import { useActiveAccount, useConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "@/lib/thirdweb";
import { Link } from "wouter";

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  gradient: string;
  category: string;
  howTo: string[];
}

interface GameCarouselItem {
  title: string;
  image: string;
  category: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Prediction Markets",
    description: "Bet on eSports matches and tournaments with CHZ tokens. Win big by predicting outcomes correctly.",
    link: "/betting",
    gradient: "from-red-500 to-pink-600",
    category: "Betting",
    howTo: [
      "Connect your wallet to the platform",
      "Browse active prediction events",
      "Select your prediction and bet amount",
      "Confirm transaction with CHZ tokens",
      "Win rewards when predictions are correct"
    ]
  },
  {
    icon: <Video className="h-8 w-8" />,
    title: "Skill Showcase",
    description: "Upload gaming clips, get verified, and earn CHZ rewards. Show off your best plays to the community.",
    link: "/videos",
    gradient: "from-purple-500 to-indigo-600",
    category: "Content",
    howTo: [
      "Record your best gaming moments",
      "Upload videos (max 500MB)",
      "Get likes and views from community",
      "Earn 0.01 CHZ per upload",
      "Get verified for extra visibility"
    ]
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Fan Token DAO",
    description: "Participate in governance decisions using fan tokens. Vote on proposals and shape the platform's future.",
    link: "/dao",
    gradient: "from-cyan-500 to-blue-600",
    category: "Governance",
    howTo: [
      "Earn fan tokens through platform activity",
      "Browse active governance proposals",
      "Vote with your token weight",
      "Create new proposals for consideration",
      "Execute approved proposals"
    ]
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "Course NFTs",
    description: "Learn from pro gamers with exclusive NFT courses. Master new strategies and techniques.",
    link: "/courses",
    gradient: "from-green-500 to-emerald-600",
    category: "Education",
    howTo: [
      "Browse available course NFTs",
      "Purchase with CHZ tokens",
      "Access exclusive learning content",
      "Download materials for offline use",
      "Rate and review courses"
    ]
  },
  {
    icon: <ShoppingCart className="h-8 w-8" />,
    title: "NFT Marketplace",
    description: "Trade gaming NFTs, skins, and collectibles. Buy, sell, and discover unique digital assets.",
    link: "/marketplace",
    gradient: "from-orange-500 to-red-600",
    category: "Trading",
    howTo: [
      "List your NFTs for sale",
      "Set competitive prices in CHZ",
      "Browse and buy from others",
      "Track your collection value",
      "Transfer items between wallets"
    ]
  }
];

const gameCarousel: GameCarouselItem[] = [
  {
    title: "Valorant Esports",
    image: "linear-gradient(135deg, #ff4655 0%, #fe7b85 100%)",
    category: "FPS",
    description: "Tactical shooter with precise gunplay and unique agent abilities"
  },
  {
    title: "League of Legends",
    image: "linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)",
    category: "MOBA",
    description: "Strategic team-based battles in the Rift"
  },
  {
    title: "CS2",
    image: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
    category: "FPS",
    description: "Classic competitive first-person shooter"
  },
  {
    title: "Dota 2",
    image: "linear-gradient(135deg, #c23616 0%, #e55039 100%)",
    category: "MOBA",
    description: "Complex strategic gameplay with endless depth"
  },
  {
    title: "Overwatch 2",
    image: "linear-gradient(135deg, #f79c42 0%, #fbb143 100%)",
    category: "FPS",
    description: "Hero-based team shooter with unique abilities"
  }
];

export default function Dashboard() {
  const [currentGame, setCurrentGame] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeBets: 89,
    totalVolume: "125,340",
    coursesAvailable: 23
  });
  const account = useActiveAccount();
  const { connect } = useConnect();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGame((prev) => (prev + 1) % gameCarousel.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const wallet = createWallet("io.metamask");
      await connect(async () => {
        await wallet.connect({
          client: client,
        });
        return wallet;
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-purple-600/20 animate-pulse" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 px-4 py-2 text-sm font-medium">
              🎮 Web3 eSports Platform
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            ChiliZ eSports Hub
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate Web3 ecosystem for eSports fans. Bet, learn, govern, and trade in the decentralized gaming universe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!account ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
              </Button>
            ) : (
              <Link href="/betting">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Start Playing
                </Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-4 text-lg"
              onClick={() => window.open("https://github.com/Ankur2606/Decentralized_Esports_Hub", "_blank")}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              View Docs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.activeBets}</div>
              <div className="text-gray-400">Active Bets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">{stats.totalVolume} CHZ</div>
              <div className="text-gray-400">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.coursesAvailable}</div>
              <div className="text-gray-400">Courses</div>
            </div>
          </div>
        </div>
      </section>
      {/* Game Carousel */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Featured Games
          </h2>
          
          <div className="relative h-64 rounded-xl overflow-hidden">
            <div 
              className="absolute inset-0 transition-all duration-1000 ease-in-out"
              style={{ background: gameCarousel[currentGame].image }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative h-full flex items-center justify-center text-center p-8">
                <div>
                  <Badge className="mb-4 bg-white/20 text-white border-0">
                    {gameCarousel[currentGame].category}
                  </Badge>
                  <h3 className="text-4xl font-bold text-white mb-4">
                    {gameCarousel[currentGame].title}
                  </h3>
                  <p className="text-xl text-gray-200 max-w-2xl">
                    {gameCarousel[currentGame].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {gameCarousel.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGame(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentGame ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Problem & Solution */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-800/50 to-purple-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-2xl text-red-400 flex items-center">
                  <Target className="mr-3 h-6 w-6" />
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>🎯 <strong>Fragmented eSports Ecosystem:</strong> Fans scattered across multiple platforms with no unified experience</p>
                <p>💰 <strong>Limited Fan Monetization:</strong> No direct way for fans to earn from their gaming skills and predictions</p>
                <p>🏛️ <strong>No Community Governance:</strong> Fans have no say in platform decisions or eSports development</p>
                <p>📚 <strong>Expensive Pro Training:</strong> High barriers to access professional gaming education</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-2xl text-green-400 flex items-center">
                  <Shield className="mr-3 h-6 w-6" />
                  Our Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>🌐 <strong>Unified Web3 Platform:</strong> All eSports activities in one decentralized ecosystem</p>
                <p>🎮 <strong>Earn While Gaming:</strong> Multiple ways to earn CHZ through predictions, content, and participation</p>
                <p>🗳️ <strong>Fan Token Governance:</strong> Community-driven decisions through blockchain voting</p>
                <p>🏆 <strong>Accessible Pro Education:</strong> NFT-based courses with transparent ownership and pricing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Features Carousel */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Platform Features
          </h2>

          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentFeature * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <Card className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 border-purple-500/20 h-full">
                      <CardHeader>
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-4`}>
                          {feature.icon}
                        </div>
                        <Badge className="w-fit mb-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {feature.category}
                        </Badge>
                        <CardTitle className="text-2xl text-white">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-300 text-lg">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <h4 className="text-cyan-400 font-semibold mb-3">How to use:</h4>
                          <ol className="text-gray-300 space-y-2">
                            {feature.howTo.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start">
                                <span className="text-cyan-400 font-bold mr-2">{stepIndex + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <Link href={feature.link}>
                          <Button className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white`}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Try {feature.title}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevFeature}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-purple-600/80 hover:bg-purple-600 text-white p-3 rounded-full transition-all pl-[9px] pr-[9px] pt-[9px] pb-[9px]"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextFeature}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-purple-600/80 hover:bg-purple-600 text-white p-3 rounded-full transition-all pt-[9px] pb-[9px] pl-[9px] pr-[9px]"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Feature Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentFeature ? 'bg-purple-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Competitive Edge */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Why Choose ChiliZ eSports Hub
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/20">
              <CardHeader>
                <Star className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-cyan-400">First of Its Kind</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>The first comprehensive Web3 eSports platform combining prediction markets, content creation, governance, and education in one ecosystem.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
              <CardHeader>
                <Coins className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-purple-400">Real Utility Token</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>CHZ tokens power everything - betting, purchases, governance, and rewards. True utility with growing demand as the platform scales.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-green-400">Community Driven</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Fan Token DAO ensures the community shapes the platform's future. Your voice matters in every major decision.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Quick Start Guide */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Get Started in 3 Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-400">Link your MetaMask to Chiliz Spicy Testnet and start your Web3 eSports journey.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get CHZ Tokens</h3>
              <p className="text-gray-400">Acquire CHZ tokens to participate in betting, governance, and marketplace activities.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Gaming</h3>
              <p className="text-gray-400">Explore features, place bets, upload content, and earn rewards in the ecosystem.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Social Links */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-800/50 to-purple-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Join Our Community</h2>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              onClick={() => window.open('https://discord.gg/pCdBSkBUHn', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Discord
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              onClick={() => window.open('https://x.com/Decent_Sanage', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Twitter
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-pink-400 text-pink-400 hover:bg-pink-400/10"
              onClick={() => window.open('https://t.me/Avg_yuri_enjoyer', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Telegram
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-green-400 text-green-400 hover:bg-green-400/10"
              onClick={() => window.open('https://www.reddit.com/r/nevergonnagiveyouup', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Reddit
            </Button>
          </div>

          <p className="text-gray-400 text-lg">
            Stay updated with the latest news, events, and community discussions. 
            Connect with fellow gamers and shape the future of Web3 eSports together.
          </p>
        </div>
      </section>
    </div>
  );
}