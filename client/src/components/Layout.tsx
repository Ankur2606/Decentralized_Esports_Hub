import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveAccount } from "thirdweb/react";
import { useWebSocket } from "@/hooks/useWebSocket";
import WalletConnect from "@/components/WalletConnect";
import { 
  Gamepad2, 
  Dice1, 
  Video, 
  Vote, 
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

  const navigation = [
    { name: "Predictions", href: "/", icon: Dice1 },
    { name: "Videos", href: "/videos", icon: Video },
    { name: "DAO", href: "/dao", icon: Vote },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-dark-bg/90 backdrop-blur-lg border-b border-cyan-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4">
              <div className="gaming-gradient p-2 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold glow-text hidden sm:block">
                ChiliZ eSports Hub
              </h1>
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
                          ? "text-cyan-accent"
                          : "text-light-text hover:text-cyan-accent"
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
                  <Badge variant="secondary" className="bg-success-green/20 text-success-green border-success-green">
                    <Wifi className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-error-red/20 text-error-red border-error-red">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>

              {/* Balance Display */}
              {account && (
                <div className="hidden sm:block text-sm">
                  <div className="text-gray-400">Balance:</div>
                  <div className="text-cyan-accent font-bold">-- CHZ</div>
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
          <div className="md:hidden border-t border-cyan-accent/20 bg-dark-bg/95">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start space-x-2 ${
                        isActive(item.href)
                          ? "text-cyan-accent bg-cyan-accent/10"
                          : "text-light-text"
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
              <div className="pt-4 border-t border-cyan-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status:</span>
                  {connected ? (
                    <Badge variant="secondary" className="bg-success-green/20 text-success-green border-success-green">
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-error-red/20 text-error-red border-error-red">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
                {account && (
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CHZ:</span>
                      <span className="text-cyan-accent font-bold">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">FTK:</span>
                      <span className="text-warning-gold font-bold">--</span>
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
