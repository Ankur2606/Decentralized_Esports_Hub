import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, CheckCircle, Clock, Play } from "lucide-react";

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

interface VideoCardProps {
  video: Video;
  onLike: () => void;
  liking: boolean;
}

export default function VideoCard({ video, onLike, liking }: VideoCardProps) {
  const convertIpfsUrl = (ipfsUrl: string) => {
    if (ipfsUrl.startsWith("ipfs://")) {
      return ipfsUrl.replace("ipfs://", "https://nftstorage.link/ipfs/");
    }
    return ipfsUrl;
  };

  const getVideoDuration = () => {
    // Mock duration based on video ID
    const durations = ["5:32", "12:45", "8:23", "15:07", "3:54"];
    return durations[video.id % durations.length];
  };

  const getThumbnailUrl = () => {
    // Mock thumbnail based on category
    const thumbnails = {
      "CS:GO": "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      "Valorant": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      "LoL": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      "Tutorials": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      default: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"
    };
    return thumbnails[video.category as keyof typeof thumbnails] || thumbnails.default;
  };

  return (
    <div className="gradient-border card-hover">
      <Card className="gradient-border-content p-0 bg-transparent border-none">
        {/* Video Thumbnail */}
        <div className="relative">
          <img 
            src={getThumbnailUrl()}
            alt={video.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-t-lg group-hover:bg-black/40 transition-colors">
            <Play className="h-12 w-12 text-white/80" />
          </div>
          <div className="absolute top-2 left-2 gaming-gradient px-2 py-1 rounded text-xs font-bold">
            {video.category}
          </div>
          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
            {getVideoDuration()}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="font-bold mb-2 text-light-text line-clamp-2">
            {video.title}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {video.description}
          </p>

          {/* Creator Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 gaming-gradient rounded-full"></div>
              <span className="text-sm text-light-text">
                {video.creator.slice(0, 10)}...
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Heart className={`w-4 h-4 ${video.likes > 0 ? 'text-pink-400' : ''}`} />
                <span>{video.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{video.views}</span>
              </div>
            </div>
          </div>

          {/* Status and Rewards */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-success-green text-sm font-medium">
                +0.01 CHZ Earned
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {video.verified ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-green" />
                  <span className="text-success-green text-sm">Verified</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-warning-gold" />
                  <span className="text-warning-gold text-sm">Pending</span>
                </>
              )}
            </div>
          </div>

          {/* Like Button */}
          <Button
            onClick={onLike}
            disabled={liking}
            variant="outline"
            className="w-full mt-4 border-pink-400/50 hover:border-pink-400 hover:bg-pink-400/10"
          >
            <Heart className="mr-2 h-4 w-4" />
            {liking ? "Liking..." : "Like Video"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
