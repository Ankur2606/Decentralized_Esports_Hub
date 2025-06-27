import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  username: text("username"),
  chzBalance: decimal("chz_balance", { precision: 18, scale: 8 }).default("0"),
  fanTokenBalance: decimal("fan_token_balance", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictionEvents = pgTable("prediction_events", {
  id: serial("id").primaryKey(),
  contractEventId: integer("contract_event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  game: text("game").notNull(),
  ipfsHash: text("ipfs_hash"),
  endTime: timestamp("end_time").notNull(),
  resolved: boolean("resolved").default(false),
  winningOption: integer("winning_option"),
  totalPool: decimal("total_pool", { precision: 18, scale: 8 }).default("0"),
  betCount: integer("bet_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => predictionEvents.id),
  userAddress: text("user_address").notNull(),
  option: integer("option").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  odds: decimal("odds", { precision: 4, scale: 2 }).notNull(),
  claimed: boolean("claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  contractVideoId: integer("contract_video_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  creator: text("creator").notNull(),
  verified: boolean("verified").default(false),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  rewardClaimed: boolean("reward_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const daoProposals = pgTable("dao_proposals", {
  id: serial("id").primaryKey(),
  contractProposalId: integer("contract_proposal_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  creator: text("creator").notNull(),
  votesFor: decimal("votes_for", { precision: 18, scale: 8 }).default("0"),
  votesAgainst: decimal("votes_against", { precision: 18, scale: 8 }).default("0"),
  executed: boolean("executed").default(false),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const daoVotes = pgTable("dao_votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => daoProposals.id),
  voter: text("voter").notNull(),
  support: boolean("support").notNull(),
  weight: decimal("weight", { precision: 18, scale: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseNfts = pgTable("course_nfts", {
  id: serial("id").primaryKey(),
  contractTokenId: integer("contract_token_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  creator: text("creator").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  ipfsUri: text("ipfs_uri").notNull(),
  purchased: boolean("purchased").default(false),
  purchaser: text("purchaser"),
  duration: text("duration"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  students: integer("students").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  contractItemId: integer("contract_item_id").notNull(),
  tokenId: integer("token_id").notNull(),
  seller: text("seller").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  sold: boolean("sold").default(false),
  buyer: text("buyer"),
  itemType: text("item_type").notNull(), // "course", "collectible", "merchandise"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPredictionEventSchema = createInsertSchema(predictionEvents).omit({ id: true, createdAt: true });
export const insertBetSchema = createInsertSchema(bets).omit({ id: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });
export const insertDaoProposalSchema = createInsertSchema(daoProposals).omit({ id: true, createdAt: true });
export const insertDaoVoteSchema = createInsertSchema(daoVotes).omit({ id: true, createdAt: true });
export const insertCourseNftSchema = createInsertSchema(courseNfts).omit({ id: true, createdAt: true });
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PredictionEvent = typeof predictionEvents.$inferSelect;
export type InsertPredictionEvent = z.infer<typeof insertPredictionEventSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type DaoProposal = typeof daoProposals.$inferSelect;
export type InsertDaoProposal = z.infer<typeof insertDaoProposalSchema>;
export type DaoVote = typeof daoVotes.$inferSelect;
export type InsertDaoVote = z.infer<typeof insertDaoVoteSchema>;
export type CourseNft = typeof courseNfts.$inferSelect;
export type InsertCourseNft = z.infer<typeof insertCourseNftSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
