import { useQuery } from "@tanstack/react-query";
import CourseCard from "@/components/CourseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users, Clock } from "lucide-react";
import type { CourseNft } from "@shared/schema";

export default function Courses() {
  const { data: courses = [], isLoading } = useQuery<CourseNft[]>({
    queryKey: ["/api/courses"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user/0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"],
  });

  const handlePurchaseCourse = async (courseId: number) => {
    try {
      // Purchase course logic will be implemented with real contracts
      console.log("Purchasing course:", courseId);
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-pulse">
              <div className="h-8 bg-purple-600/30 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-purple-600/20 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            eSports Academy
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Learn from pro gamers and improve your skills with NFT-based courses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-purple-800/30 border-purple-600/50">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{courses.length}</div>
              <div className="text-sm text-gray-300">Available Courses</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-800/30 border-blue-600/50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {courses.reduce((total, course) => total + (course.students || 0), 0)}
              </div>
              <div className="text-sm text-gray-300">Total Students</div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-800/30 border-indigo-600/50">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-sm text-gray-300">Average Rating</div>
            </CardContent>
          </Card>
          
          <Card className="bg-pink-800/30 border-pink-600/50">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {courses.reduce((total, course) => total + parseInt(course.duration?.split(' ')[0] || '0'), 0)}h
              </div>
              <div className="text-sm text-gray-300">Total Content</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {["All Courses", "Valorant", "CS:GO", "League of Legends", "Rocket League"].map((category) => (
              <Button
                key={category}
                variant={category === "All Courses" ? "default" : "outline"}
                className={category === "All Courses" 
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600" 
                  : "border-purple-600/50 text-gray-300 hover:bg-purple-600/20"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-center text-gray-300">No Courses Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">
                Create your first course NFT using the admin panel to get started!
              </p>
              <Button 
                variant="outline" 
                className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20"
                onClick={() => window.location.href = '/admin'}
              >
                Go to Admin Panel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPurchase={() => handlePurchaseCourse(course.id)}
                purchasing={false}
              />
            ))}
          </div>
        )}

        {/* How It Works */}
        <Card className="mt-12 bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-600/50">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">How eSports Academy Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Browse Courses</h3>
                <p className="text-gray-300 text-sm">
                  Explore courses created by pro gamers and skilled players
                </p>
              </div>
              
              <div>
                <div className="bg-cyan-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Purchase with CHZ</h3>
                <p className="text-gray-300 text-sm">
                  Buy course NFTs using CHZ tokens on Chiliz network
                </p>
              </div>
              
              <div>
                <div className="bg-pink-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Learn & Improve</h3>
                <p className="text-gray-300 text-sm">
                  Access exclusive content and level up your gaming skills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}