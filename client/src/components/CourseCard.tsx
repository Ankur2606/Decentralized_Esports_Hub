import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, CheckCircle, GraduationCap } from "lucide-react";

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

interface CourseCardProps {
  course: CourseNft;
  onPurchase: () => void;
  purchasing: boolean;
}

export default function CourseCard({ course, onPurchase, purchasing }: CourseCardProps) {
  const getCreatorDisplayName = () => {
    const creators = {
      "s1mple": "s1mple_official",
      "TenZ": "TenZ_SEN", 
      "Faker": "T1_Faker"
    };
    
    // Check if creator matches known pro players
    for (const [name, display] of Object.entries(creators)) {
      if (course.creator.toLowerCase().includes(name.toLowerCase())) {
        return display;
      }
    }
    
    // Fallback to shortened address
    return `${course.creator.slice(0, 8)}...${course.creator.slice(-4)}`;
  };

  const getThumbnailUrl = () => {
    // Mock thumbnails based on course content
    const thumbnails = {
      "cs:go": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      "valorant": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      "lol": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
      default: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"
    };
    
    const courseTitle = course.title.toLowerCase();
    for (const [key, url] of Object.entries(thumbnails)) {
      if (courseTitle.includes(key)) return url;
    }
    return thumbnails.default;
  };

  const formatPrice = () => {
    const priceFloat = parseFloat(course.price);
    const usdPrice = priceFloat * 18.2; // Mock CHZ to USD rate
    return {
      chz: priceFloat.toFixed(1),
      usd: usdPrice.toFixed(2)
    };
  };

  const price = formatPrice();

  return (
    <div className="gradient-border card-hover">
      <Card className="gradient-border-content p-0 bg-transparent border-none">
        {/* Course Thumbnail */}
        <div className="relative">
          <img 
            src={getThumbnailUrl()}
            alt={course.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 left-2 gaming-gradient px-2 py-1 rounded text-xs font-bold">
            PRO COURSE
          </div>
          {course.students > 200 && (
            <div className="absolute top-2 right-2 bg-warning-gold px-2 py-1 rounded text-xs font-bold text-dark-bg">
              HOT
            </div>
          )}
          {course.students < 50 && (
            <div className="absolute top-2 right-2 bg-success-green px-2 py-1 rounded text-xs font-bold">
              NEW
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4">
          <h3 className="font-bold mb-2 text-light-text line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Creator and Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 gaming-gradient rounded-full"></div>
              <span className="text-sm font-medium text-light-text">
                {getCreatorDisplayName()}
              </span>
              <CheckCircle className="w-4 h-4 text-cyan-accent" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-cyan-accent">
                {price.chz} CHZ
              </p>
              <p className="text-xs text-gray-400">
                ≈ ${price.usd}
              </p>
            </div>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration || "4.5 hours"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{course.students} students</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-warning-gold" />
              <span>{parseFloat(course.rating || "4.9").toFixed(1)}</span>
            </div>
          </div>

          {/* Purchase Button */}
          {course.purchased ? (
            <Button 
              disabled
              className="w-full bg-success-green/20 text-success-green border border-success-green"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Purchased
            </Button>
          ) : (
            <Button
              onClick={onPurchase}
              disabled={purchasing}
              className="w-full gaming-gradient hover:neon-cyan card-hover"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              {purchasing ? "Purchasing..." : "Purchase Course"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
