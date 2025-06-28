# ChiliZ eSports Hub - Web3 dApp

## Overview

ChiliZ eSports Hub is a comprehensive Web3 ecosystem for eSports fans built on the Chiliz Spicy Testnet. The application combines prediction markets, video showcasing, DAO governance, NFT course marketplace, and virtual merchandise trading into a unified platform using CHZ tokens for all transactions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming theme (dark background #0A0618, purple/cyan gradients)
- **Build Tool**: Vite with custom configuration for client bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **WebSocket**: Native WebSocket server for real-time blockchain event updates
- **File Upload**: Multer middleware for video/image handling (500MB limit)
- **API Design**: RESTful endpoints with consistent error handling

### Blockchain Integration
- **Network**: Chiliz Spicy Testnet (Chain ID: 88882)
- **Web3 SDK**: Thirdweb SDK for smart contract interactions
- **Contracts**: 5 main contracts (PredictionMarket, FanTokenDAO, SkillShowcase, CourseNFT, Marketplace)
- **Admin Wallet**: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa

## Key Components

### Smart Contract System
- **PredictionMarket**: Event creation, betting, and resolution
- **FanTokenDAO**: Governance token minting and proposal voting
- **SkillShowcase**: Video uploads with CHZ rewards (0.01 CHZ per upload)
- **CourseNFT**: NFT-based course creation and purchasing
- **Marketplace**: Trading platform for virtual items and NFTs

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Comprehensive schema covering users, events, bets, videos, DAO proposals, courses, and marketplace items
- **Connection**: Neon Database serverless PostgreSQL instance

### Real-time Features
- **WebSocket Server**: Real-time updates for betting, video likes, and DAO votes
- **Event Broadcasting**: Automatic client notification for blockchain events
- **Connection Management**: Auto-reconnection with exponential backoff

### IPFS Storage
- **Provider**: NFT.Storage (unlimited free storage)
- **Use Cases**: Video files, course content, NFT metadata
- **Integration**: Automated upload and retrieval with IPFS hash storage

## Data Flow

### User Actions
1. **Wallet Connection**: Mock wallet integration (expandable to real Web3 wallets)
2. **Betting Flow**: Event selection → Bet placement → Real-time updates → Winnings claim
3. **Video Upload**: File upload → IPFS storage → Blockchain registration → CHZ reward
4. **DAO Participation**: Proposal creation → Voting with token weight → Execution
5. **Course Purchase**: NFT browsing → CHZ payment → Access grant

### Real-time Updates
1. Blockchain events trigger server-side handlers
2. WebSocket broadcasts updates to connected clients
3. Frontend updates UI without full page refresh
4. Query cache invalidation ensures data consistency

## External Dependencies

### Blockchain
- **Thirdweb SDK**: Smart contract deployment and interaction
- **Chiliz Network**: CHZ token transactions and smart contract execution

### Storage
- **NFT.Storage**: IPFS pinning service for content storage
- **Neon Database**: Serverless PostgreSQL for application data

### UI/UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent iconography

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Development migrations with Drizzle Kit

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: esbuild bundle for Node.js deployment
- **Static Assets**: Served from dist/public directory

### Environment Configuration
- **Database**: DATABASE_URL for PostgreSQL connection
- **IPFS**: NFT_STORAGE_API_KEY for file uploads
- **Web3**: Contract addresses and admin private key
- **Thirdweb**: Client ID for SDK initialization

## Changelog

Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Added comprehensive admin deployment system with Thirdweb CLI integration, contract management, and real-time deployment status tracking
- June 27, 2025. Created modern eSports-themed dashboard with Valorant aesthetics, animated carousels, problem/solution breakdown, feature showcases with usage instructions, competitive edge highlights, and social integration for new user onboarding
- June 27, 2025. Updated social media integration with live community links (Discord, Twitter, Telegram, Reddit) and created comprehensive technical README with innovative platform positioning, detailed architecture documentation, and professional developer onboarding guide
- June 27, 2025. Fixed wallet connection functionality in dashboard with proper Thirdweb integration and connected "View Docs" button to GitHub repository (https://github.com/Ankur2606/Decentralized_Esports_Hub)
- June 27, 2025. Completed full smart contract suite (PredictionMarket, FanTokenDAO, SkillShowcase, CourseNFT, Marketplace) with gas-optimized deployment for Chiliz Spicy Testnet, comprehensive admin panel with CLI commands, testing functions, and deployment management interface
- June 28, 2025. Fixed contract compilation errors by creating standalone versions without external dependencies, resolved foundry.toml configuration issues, and created working deployment commands with proper constructor arguments for Chiliz Spicy Testnet deployment
- June 28, 2025. Successfully deployed all five contracts to Chiliz Spicy Testnet using MetaMask workflow, created comprehensive testing interface with contract significance guides, implemented backend testing APIs for all contract functions, and completed user-friendly testing dashboard with real-time transaction monitoring

## User Preferences

Preferred communication style: Simple, everyday language.