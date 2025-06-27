import {
  users, predictionEvents, bets, videos, daoProposals, daoVotes, courseNfts, marketplaceItems,
  type User, type InsertUser, type PredictionEvent, type InsertPredictionEvent,
  type Bet, type InsertBet, type Video, type InsertVideo,
  type DaoProposal, type InsertDaoProposal, type DaoVote, type InsertDaoVote,
  type CourseNft, type InsertCourseNft, type MarketplaceItem, type InsertMarketplaceItem
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(address: string, chzBalance: string, fanTokenBalance: string): Promise<User>;

  // Prediction Events
  getPredictionEvents(): Promise<PredictionEvent[]>;
  getPredictionEvent(id: number): Promise<PredictionEvent | undefined>;
  createPredictionEvent(event: InsertPredictionEvent): Promise<PredictionEvent>;
  updatePredictionEvent(id: number, updates: Partial<PredictionEvent>): Promise<PredictionEvent>;

  // Bets
  getBets(eventId: number): Promise<Bet[]>;
  getUserBets(userAddress: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetClaimed(id: number): Promise<Bet>;

  // Videos
  getVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoVerification(id: number, verified: boolean): Promise<Video>;
  updateVideoLikes(id: number, likes: number): Promise<Video>;

  // DAO
  getDaoProposals(): Promise<DaoProposal[]>;
  getDaoProposal(id: number): Promise<DaoProposal | undefined>;
  createDaoProposal(proposal: InsertDaoProposal): Promise<DaoProposal>;
  createDaoVote(vote: InsertDaoVote): Promise<DaoVote>;
  updateProposalVotes(id: number, votesFor: string, votesAgainst: string): Promise<DaoProposal>;

  // Course NFTs
  getCourseNfts(): Promise<CourseNft[]>;
  getCourseNft(id: number): Promise<CourseNft | undefined>;
  createCourseNft(course: InsertCourseNft): Promise<CourseNft>;
  updateCourseNftPurchase(id: number, purchaser: string): Promise<CourseNft>;

  // Marketplace
  getMarketplaceItems(): Promise<MarketplaceItem[]>;
  getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  updateMarketplaceItemSold(id: number, buyer: string): Promise<MarketplaceItem>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private predictionEvents: Map<number, PredictionEvent> = new Map();
  private bets: Map<number, Bet> = new Map();
  private videos: Map<number, Video> = new Map();
  private daoProposals: Map<number, DaoProposal> = new Map();
  private daoVotes: Map<number, DaoVote> = new Map();
  private courseNfts: Map<number, CourseNft> = new Map();
  private marketplaceItems: Map<number, MarketplaceItem> = new Map();
  
  private currentId = 1;

  // Users
  async getUser(address: string): Promise<User | undefined> {
    return this.users.get(address);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentId++, 
      createdAt: new Date() 
    };
    this.users.set(user.address, user);
    return user;
  }

  async updateUserBalance(address: string, chzBalance: string, fanTokenBalance: string): Promise<User> {
    const user = this.users.get(address);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, chzBalance, fanTokenBalance };
    this.users.set(address, updatedUser);
    return updatedUser;
  }

  // Prediction Events
  async getPredictionEvents(): Promise<PredictionEvent[]> {
    return Array.from(this.predictionEvents.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPredictionEvent(id: number): Promise<PredictionEvent | undefined> {
    return this.predictionEvents.get(id);
  }

  async createPredictionEvent(insertEvent: InsertPredictionEvent): Promise<PredictionEvent> {
    const event: PredictionEvent = {
      ...insertEvent,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.predictionEvents.set(event.id, event);
    return event;
  }

  async updatePredictionEvent(id: number, updates: Partial<PredictionEvent>): Promise<PredictionEvent> {
    const event = this.predictionEvents.get(id);
    if (!event) throw new Error("Event not found");
    
    const updatedEvent = { ...event, ...updates };
    this.predictionEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  // Bets
  async getBets(eventId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getUserBets(userAddress: string): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.userAddress === userAddress)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const bet: Bet = {
      ...insertBet,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.bets.set(bet.id, bet);
    return bet;
  }

  async updateBetClaimed(id: number): Promise<Bet> {
    const bet = this.bets.get(id);
    if (!bet) throw new Error("Bet not found");
    
    const updatedBet = { ...bet, claimed: true };
    this.bets.set(id, updatedBet);
    return updatedBet;
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const video: Video = {
      ...insertVideo,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.videos.set(video.id, video);
    return video;
  }

  async updateVideoVerification(id: number, verified: boolean): Promise<Video> {
    const video = this.videos.get(id);
    if (!video) throw new Error("Video not found");
    
    const updatedVideo = { ...video, verified };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async updateVideoLikes(id: number, likes: number): Promise<Video> {
    const video = this.videos.get(id);
    if (!video) throw new Error("Video not found");
    
    const updatedVideo = { ...video, likes };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  // DAO
  async getDaoProposals(): Promise<DaoProposal[]> {
    return Array.from(this.daoProposals.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getDaoProposal(id: number): Promise<DaoProposal | undefined> {
    return this.daoProposals.get(id);
  }

  async createDaoProposal(insertProposal: InsertDaoProposal): Promise<DaoProposal> {
    const proposal: DaoProposal = {
      ...insertProposal,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.daoProposals.set(proposal.id, proposal);
    return proposal;
  }

  async createDaoVote(insertVote: InsertDaoVote): Promise<DaoVote> {
    const vote: DaoVote = {
      ...insertVote,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.daoVotes.set(vote.id, vote);
    return vote;
  }

  async updateProposalVotes(id: number, votesFor: string, votesAgainst: string): Promise<DaoProposal> {
    const proposal = this.daoProposals.get(id);
    if (!proposal) throw new Error("Proposal not found");
    
    const updatedProposal = { ...proposal, votesFor, votesAgainst };
    this.daoProposals.set(id, updatedProposal);
    return updatedProposal;
  }

  // Course NFTs
  async getCourseNfts(): Promise<CourseNft[]> {
    return Array.from(this.courseNfts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCourseNft(id: number): Promise<CourseNft | undefined> {
    return this.courseNfts.get(id);
  }

  async createCourseNft(insertCourse: InsertCourseNft): Promise<CourseNft> {
    const course: CourseNft = {
      ...insertCourse,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.courseNfts.set(course.id, course);
    return course;
  }

  async updateCourseNftPurchase(id: number, purchaser: string): Promise<CourseNft> {
    const course = this.courseNfts.get(id);
    if (!course) throw new Error("Course not found");
    
    const updatedCourse = { ...course, purchased: true, purchaser, students: course.students + 1 };
    this.courseNfts.set(id, updatedCourse);
    return updatedCourse;
  }

  // Marketplace
  async getMarketplaceItems(): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values())
      .filter(item => !item.sold)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined> {
    return this.marketplaceItems.get(id);
  }

  async createMarketplaceItem(insertItem: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const item: MarketplaceItem = {
      ...insertItem,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.marketplaceItems.set(item.id, item);
    return item;
  }

  async updateMarketplaceItemSold(id: number, buyer: string): Promise<MarketplaceItem> {
    const item = this.marketplaceItems.get(id);
    if (!item) throw new Error("Item not found");
    
    const updatedItem = { ...item, sold: true, buyer };
    this.marketplaceItems.set(id, updatedItem);
    return updatedItem;
  }
}

export const storage = new MemStorage();
