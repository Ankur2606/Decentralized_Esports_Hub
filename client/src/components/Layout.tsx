import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { useWebSocket } from "@/hooks/useWebSocket";
import WalletConnect from "@/components/WalletConnect";
import { client, chilizSpicyTestnet } from "@/lib/thirdweb";
import logoImage from "@assets/image_1751064571292.png";
import { 
  Home,
  Trophy,
  Video, 
  Vote, 
  GraduationCap,
  ShoppingCart, 
  Menu,
  X,
  Wifi,
  WifiOff
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const account = useActiveAccount();
  const { connected } = useWebSocket();
  
  const { data: chzBalance, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain: chilizSpicyTestnet,
    address: account?.address,
  });

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Predictions", href: "/betting", icon: Trophy },
    { name: "Videos", href: "/videos", icon: Video },
    { name: "DAO", href: "/dao", icon: Vote },
    { name: "Courses", href: "/courses", icon: GraduationCap },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center">
                <img 
                  src={logoImage} 
                  alt="ChiliZ eSports Hub" 
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 transition-colors ${
                        isActive(item.href)
                          ? "text-cyan-400"
                          : "text-white hover:text-cyan-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Wallet & Status */}
            <div className="flex items-center space-x-4">
              {/* WebSocket Status */}
              <div className="hidden sm:flex items-center space-x-2">
                {connected ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-400 animate-pulse">
                    <Wifi className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-400">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Connecting...
                  </Badge>
                )}
              </div>

              {/* Balance Display */}
              {account && (
                <div className="hidden sm:block text-sm">
                  <div className="text-gray-400">Balance:</div>
                  <div className="text-cyan-400 font-bold">
                    {balanceLoading ? 
                      "Loading..." : 
                      `${chzBalance ? parseFloat(chzBalance.displayValue).toFixed(2) : "0.00"} CHZ`
                    }
                  </div>
                </div>
              )}

              {/* Wallet Connection */}
              <WalletConnect />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-400/20 bg-slate-900/95">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start space-x-2 ${
                        isActive(item.href)
                          ? "text-cyan-400 bg-cyan-400/10"
                          : "text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
              
              {/* Mobile Status */}
              <div className="pt-4 border-t border-cyan-400/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status:</span>
                  {connected ? (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-400">
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-400">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
                {account && (
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CHZ:</span>
                      <span className="text-cyan-400 font-bold">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">FTK:</span>
                      <span className="text-yellow-400 font-bold">--</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
