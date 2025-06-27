import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/CourseCard";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, GraduationCap, Trophy, Shirt, TrendingUp, Users, Clock, Star } from "lucide-react";

interface CourseNft {
  id: number;
  contractTokenId: number;
  title: string;
  description: string;
  creator: string;
  price: string;
  ipfsUri: string;
  purchased: boolean;
  purchaser: string | null;
  duration: string;
  rating: string;
  students: number;
  createdAt: string;
}

interface MarketplaceItem {
  id: number;
  contractItemId: number;
  tokenId: number;
  seller: string;
  price: string;
  sold: boolean;
  buyer: string | null;
  itemType: string;
  metadata: any;
  createdAt: string;
}

interface RecentSale {
  itemName: string;
  buyer: string;
  price: string;
  timestamp: string;
  type: string;
}

export default function Marketplace() {
  const [selectedTab, setSelectedTab] = useState("courses");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery<CourseNft[]>({
    queryKey: ["/api/courses"],
  });

  const { data: items, isLoading: itemsLoading } = useQuery<MarketplaceItem[]>({
    queryKey: ["/api/marketplace"],
  });

  const purchaseCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaser: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", // Mock address
        }),
      });
      if (!response.ok) throw new Error("Failed to purchase course");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Purchase Successful!",
        description: "The course has been added to your library.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to purchase course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const buyItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          buyer: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", // Mock address
        }),
      });
      if (!response.ok) throw new Error("Failed to buy item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({
        title: "Purchase Successful!",
        description: "The item has been added to your inventory.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to buy item. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (coursesLoading || itemsLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded loading-shimmer" />
          <div className="h-10 w-64 bg-muted animate-pulse rounded loading-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-xl loading-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const availableItems = items?.filter(item => !item.sold) || [];
  const totalCourseValue = courses?.reduce((sum, course) => sum + parseFloat(course.price), 0) || 0;
  const totalStudents = courses?.reduce((sum, course) => sum + course.students, 0) || 0;
  const featuredCourses = courses?.slice(0, 6) || [];

  // Mock recent sales data
  const recentSales: RecentSale[] = [
    {
      itemName: "TenZ Valorant Course",
      buyer: "0x8765...4321",
      price: "1.8 CHZ",
      timestamp: "2 minutes ago",
      type: "course"
    },
    {
      itemName: "Golden Trophy NFT",
      buyer: "0x9876...1234",
      price: "0.5 CHZ",
      timestamp: "15 minutes ago",
      type: "collectible"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text">NFT Marketplace</h1>
          <p className="text-gray-400 mt-2">
            Discover pro courses, collectibles, and virtual merchandise
          </p>
        </div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-muted">
            <TabsTrigger 
              value="courses"
              className="data-[state=active]:bg-cyan-accent data-[state=active]:text-dark-bg"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="collectibles"
              className="data-[state=active]:bg-cyan-accent data-[state=active]:text-dark-bg"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Collectibles
            </TabsTrigger>
            <TabsTrigger 
              value="merchandise"
              className="data-[state=active]:bg-cyan-accent data-[state=active]:text-dark-bg"
            >
              <Shirt className="mr-2 h-4 w-4" />
              Merchandise
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pro Courses</p>
              <p className="text-2xl font-bold text-cyan-accent">{courses?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-success-green">{totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Items Available</p>
              <p className="text-2xl font-bold text-warning-gold">{availableItems.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-error-red">{totalCourseValue.toFixed(1)} CHZ</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Marketplace Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsContent value="courses">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Featured Pro Courses</h2>
            {featuredCourses.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses available</h3>
                <p className="text-gray-400">
                  Check back soon for new pro player courses!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course}
                    onPurchase={() => purchaseCourseMutation.mutate(course.id)}
                    purchasing={purchaseCourseMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="collectibles">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Digital Collectibles</h2>
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400">
                Rare trophies, badges, and achievements will be available soon!
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="merchandise">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Virtual Merchandise</h2>
            <div className="text-center py-12">
              <Shirt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400">
                Avatar skins, virtual jerseys, and team merchandise coming soon!
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Sales */}
      <Card className="p-6 bg-card-gradient border-cyan-accent/20">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-warning-gold" />
          Recent Sales
        </h3>
        <div className="space-y-3">
          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No recent sales to display.</p>
            </div>
          ) : (
            recentSales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 gaming-gradient rounded-full flex items-center justify-center">
                    {sale.type === 'course' && <GraduationCap className="w-4 h-4" />}
                    {sale.type === 'collectible' && <Trophy className="w-4 h-4" />}
                    {sale.type === 'merchandise' && <Shirt className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{sale.itemName}</p>
                    <p className="text-sm text-gray-400">
                      Purchased by {sale.buyer} • {sale.timestamp}
                    </p>
                  </div>
                </div>
                <span className="text-cyan-accent font-bold">
                  {sale.price}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
