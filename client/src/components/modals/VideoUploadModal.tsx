import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload, CloudUpload, Coins, X } from "lucide-react";

interface VideoUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VideoUploadModal({ open, onClose }: VideoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video Uploaded!",
        description: "Your video has been uploaded to IPFS and you earned 0.01 CHZ!",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith("video/")) {
      toast({
        title: "Invalid File",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Video file must be smaller than 500MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file || !title || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a video file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("creator", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"); // Mock address

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-dark-bg border-cyan-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Upload Skill Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver 
                ? "border-cyan-accent bg-cyan-accent/10" 
                : "border-cyan-accent/50 hover:border-cyan-accent"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById("video-file-input")?.click()}
          >
            <CloudUpload className="h-12 w-12 text-cyan-accent mx-auto mb-4" />
            {file ? (
              <div>
                <p className="text-lg font-medium mb-2 text-light-text">
                  {file.name}
                </p>
                <p className="text-sm text-gray-400">
                  {formatFileSize(file.size)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-error-red hover:text-error-red"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2 text-light-text">
                  Drop your video here or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  MP4, MOV, AVI up to 500MB
                </p>
              </div>
            )}
            <input
              id="video-file-input"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Video Details */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-cyan-accent"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your gameplay..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-cyan-accent resize-none"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Game Category *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-800 border-gray-600 focus:border-cyan-accent">
                <SelectValue placeholder="Select game..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="CS:GO">CS:GO</SelectItem>
                <SelectItem value="Valorant">Valorant</SelectItem>
                <SelectItem value="LoL">League of Legends</SelectItem>
                <SelectItem value="Fortnite">Fortnite</SelectItem>
                <SelectItem value="Tutorials">Tutorials</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reward Info */}
          <Card className="p-4 bg-success-green/10 border-success-green/30">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="h-5 w-5 text-success-green" />
              <span className="font-medium text-success-green">Upload Reward</span>
            </div>
            <p className="text-sm text-gray-300">
              Earn <span className="text-success-green font-bold">0.01 CHZ</span> for each video upload. 
              Additional rewards available after admin verification.
            </p>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={uploadMutation.isPending || !file || !title || !category}
            className="w-full gaming-gradient hover:neon-cyan card-hover"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? "Uploading to IPFS..." : "Upload to IPFS & Earn CHZ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
