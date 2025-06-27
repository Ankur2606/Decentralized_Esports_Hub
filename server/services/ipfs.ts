import { NFTStorage, File } from "nft.storage";

class IPFSService {
  private client: NFTStorage | null = null;

  constructor() {
    const apiKey = process.env.NFT_STORAGE_KEY || process.env.NFT_STORAGE_API_KEY || "";
    if (apiKey) {
      this.client = new NFTStorage({ token: apiKey });
      console.log("IPFS service initialized with API key");
    } else {
      console.log("IPFS service initialized without API key - upload functions will be mocked");
    }
  }

  async uploadVideo(file: Express.Multer.File, metadata: {
    title: string;
    description: string;
    category: string;
    creator: string;
  }): Promise<string> {
    if (!this.client) {
      console.log("Mock uploadVideo:", { filename: file.originalname, metadata });
      return "ipfs://mock-video-hash-" + Date.now();
    }

    try {
      // Create File object from buffer
      const videoFile = new File([file.buffer], file.originalname, {
        type: file.mimetype,
      });

      // Upload video and metadata to IPFS
      const nft = await this.client.store({
        image: videoFile,
        name: metadata.title,
        description: metadata.description,
        properties: {
          category: metadata.category,
          creator: metadata.creator,
          uploadedAt: new Date().toISOString(),
          fileType: file.mimetype,
          fileSize: file.size,
        },
      });

      return nft.url;
    } catch (error) {
      console.error("IPFS video upload error:", error);
      throw new Error("Failed to upload video to IPFS");
    }
  }

  async uploadImage(file: Express.Multer.File, metadata: {
    name: string;
    description?: string;
  }): Promise<string> {
    try {
      const imageFile = new File([file.buffer], file.originalname, {
        type: file.mimetype,
      });

      const nft = await this.client.store({
        image: imageFile,
        name: metadata.name,
        description: metadata.description || "",
        properties: {
          uploadedAt: new Date().toISOString(),
          fileType: file.mimetype,
          fileSize: file.size,
        },
      });

      return nft.url;
    } catch (error) {
      console.error("IPFS image upload error:", error);
      throw new Error("Failed to upload image to IPFS");
    }
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const jsonFile = new File([jsonString], "metadata.json", {
        type: "application/json",
      });

      const nft = await this.client.store({
        image: jsonFile,
        name: "Metadata",
        description: "JSON metadata",
        properties: data,
      });

      return nft.url;
    } catch (error) {
      console.error("IPFS JSON upload error:", error);
      throw new Error("Failed to upload JSON to IPFS");
    }
  }

  // Convert IPFS URL to HTTP gateway URL for display
  convertToHttpUrl(ipfsUrl: string): string {
    if (ipfsUrl.startsWith("ipfs://")) {
      return ipfsUrl.replace("ipfs://", "https://nftstorage.link/ipfs/");
    }
    return ipfsUrl;
  }

  // Extract IPFS hash from URL
  extractHash(ipfsUrl: string): string {
    if (ipfsUrl.startsWith("ipfs://")) {
      return ipfsUrl.replace("ipfs://", "");
    }
    if (ipfsUrl.includes("/ipfs/")) {
      return ipfsUrl.split("/ipfs/")[1];
    }
    return ipfsUrl;
  }
}

export const ipfsService = new IPFSService();
