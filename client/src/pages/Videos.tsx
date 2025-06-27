import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoCard from "@/components/VideoCard";
import VideoUploadModal from "@/components/modals/VideoUploadModal";
import { Upload, Video, Trophy, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: number;
  contractVideoId: number;
  title: string;
  description: string;
  category: string;
  ipfsHash: string;
  creator: string;
  verified: boolean;
  likes: number;
  views: number;
  rewardClaimed: boolean;
  createdAt: string;
}

export default function Videos() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const likeVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to like video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video Liked!",
        description: "Your like has been recorded on the blockchain.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = ["all", "CS:GO", "Valorant", "LoL", "Tutorials", "Other"];

  const filteredVideos = videos?.filter(video => 
    selectedCategory === "all" || video.category === selectedCategory
  ) || [];

  const totalViews = videos?.reduce((sum, video) => sum + video.views, 0) || 0;
  const totalLikes = videos?.reduce((sum, video) => sum + video.likes, 0) || 0;
  const verifiedVideos = videos?.filter(video => video.verified).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded loading-shimmer" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded loading-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-xl loading-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text">Skill Showcase</h1>
          <p className="text-gray-400 mt-2">
            Upload your best gameplay moments and earn CHZ rewards
          </p>
        </div>
        <Button 
          onClick={() => setUploadModalOpen(true)}
          className="gaming-gradient hover:neon-cyan card-hover"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="gradient-border">
          <div className="gradient-border-content text-center">
            <Video className="h-8 w-8 text-cyan-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-cyan-accent">{videos?.length || 0}</p>
            <p className="text-gray-400 text-sm">Total Videos</p>
          </div>
        </div>

        <div className="gradient-border">
          <div className="gradient-border-content text-center">
            <Eye className="h-8 w-8 text-success-green mx-auto mb-2" />
            <p className="text-2xl font-bold text-success-green">{totalViews}</p>
            <p className="text-gray-400 text-sm">Total Views</p>
          </div>
        </div>

        <div className="gradient-border">
          <div className="gradient-border-content text-center">
            <Trophy className="h-8 w-8 text-warning-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning-gold">{totalLikes}</p>
            <p className="text-gray-400 text-sm">Total Likes</p>
          </div>
        </div>

        <div className="gradient-border">
          <div className="gradient-border-content text-center">
            <Clock className="h-8 w-8 text-error-red mx-auto mb-2" />
            <p className="text-2xl font-bold text-error-red">{verifiedVideos}</p>
            <p className="text-gray-400 text-sm">Verified</p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-6 w-full bg-muted">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="capitalize data-[state=active]:bg-cyan-accent data-[state=active]:text-dark-bg"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No videos found</h3>
              <p className="text-gray-400 mb-4">
                {selectedCategory === "all" 
                  ? "Be the first to upload a video and earn CHZ rewards!"
                  : `No videos in the ${selectedCategory} category yet.`
                }
              </p>
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="gaming-gradient hover:neon-cyan"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload First Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video}
                  onLike={() => likeVideoMutation.mutate(video.id)}
                  liking={likeVideoMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <VideoUploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
