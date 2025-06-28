# ChiliZ eSports Hub - Contract Testing Guide

## Contract Overview & Significance

Your eSports ecosystem consists of five interconnected smart contracts, each serving a specific purpose in the gaming community platform.

### 1. PredictionMarket Contract
**Purpose**: Create and manage prediction markets for eSports events
**Significance**: 
- Allows fans to bet on match outcomes using CHZ tokens
- Creates engaging community participation around tournaments
- Generates platform revenue through betting fees
- Provides liquidity for event prediction markets

**Key Features**:
- Event creation with customizable end times
- Multi-option betting (Team A, Team B, Draw)
- Automatic winnings distribution
- Minimum bet: 0.001 CHZ (gas-optimized)

**How to Test**:
1. Visit `/admin` → Testing Functions tab
2. Enter event name: "Valorant Championship Final"
3. Click "Create Betting Event"
4. Check transaction on [Chiliz Explorer](https://testnet.chiliscan.com)
5. Visit main app to see event listed for betting

---

### 2. FanTokenDAO Contract
**Purpose**: Community governance through fan token distribution
**Significance**:
- Democratizes decision-making for the platform
- Rewards active community members with voting power
- Creates token-based incentive system
- Enables decentralized governance proposals

**Key Features**:
- Mint FTK (Fan Token) to community members
- Token-weighted voting on proposals
- Governance proposal creation
- Admin-controlled token distribution

**How to Test**:
1. In admin panel, enter token amount: "100"
2. Click "Mint Fan Tokens"
3. Tokens are minted to admin address: 0x0734...47Fa
4. Use tokens for voting on future DAO proposals
5. Check balance via contract read functions

---

### 3. SkillShowcase Contract
**Purpose**: Gaming video platform with CHZ rewards
**Significance**:
- Incentivizes content creation in gaming community
- Rewards skill demonstration with real value (CHZ)
- Creates social engagement through video sharing
- Builds content library for platform growth

**Key Features**:
- Video upload with IPFS hash storage
- 0.01 CHZ reward per upload
- Video verification system
- Like/engagement tracking

**How to Test**:
1. Enter video title: "Epic Clutch Play"
2. Click "Upload Test Video"
3. Earn 0.01 CHZ reward automatically
4. Video appears in skill showcase section
5. Community can like and engage with content

---

### 4. CourseNFT Contract
**Purpose**: Educational NFT marketplace for gaming tutorials
**Significance**:
- Monetizes gaming expertise and knowledge
- Creates revenue stream for skilled players
- Builds educational ecosystem within platform
- Uses NFT technology for course ownership

**Key Features**:
- Lazy minting for cost-effective NFT creation
- Customizable course pricing (minimum 0.1 CHZ)
- Royalty system for creators (2.5%)
- Purchaser verification and access control

**How to Test**:
1. Enter course title: "Valorant Pro Strategies"
2. Click "Create Course NFT"
3. NFT is minted with metadata
4. Course appears in marketplace for purchase
5. Students can buy with CHZ tokens

---

### 5. Marketplace Contract
**Purpose**: General trading platform for virtual items and NFTs
**Significance**:
- Enables peer-to-peer trading of gaming assets
- Creates secondary market for valuable items
- Generates platform fees (2.5% per transaction)
- Supports broader Web3 gaming economy

**Key Features**:
- List any ERC-721 or virtual items
- Flexible pricing in CHZ tokens
- Instant trading with escrow security
- Platform fee collection

**How to Test**:
1. Enter item name: "Rare Weapon Skin"
2. Click "List Test Item"
3. Item appears in marketplace
4. Other users can purchase instantly
5. Platform collects 2.5% fee automatically

## Testing Workflow

### Prerequisites
1. Ensure all contracts are deployed to Chiliz Spicy Testnet
2. Have CHZ tokens in admin wallet for gas fees
3. Update contract addresses in environment variables

### Step-by-Step Testing Process

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Switch to "Testing Functions" tab

2. **Test Each Contract**
   - Use provided forms to interact with contracts
   - Watch for success/error messages
   - Check transaction links on explorer

3. **Verify Results**
   - Testing Results panel shows live contract interactions
   - Green = Success, Red = Error
   - Click transaction links to verify on blockchain

4. **Check Main App**
   - Visit main pages to see created content
   - Betting events appear on prediction page
   - Videos show in skill showcase
   - Courses available in marketplace

### Transaction Monitoring

All test transactions are viewable on Chiliz Spicy Testnet Explorer:
- **Explorer URL**: https://testnet.chiliscan.com
- **Network**: Chiliz Spicy (Chain ID: 88882)
- **Admin Address**: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa

### Gas Costs
- Event Creation: ~0.002 CHZ
- Token Minting: ~0.001 CHZ
- Video Upload: ~0.0015 CHZ
- Course NFT: ~0.002 CHZ
- Marketplace Listing: ~0.0018 CHZ

## Economic Model

### Revenue Streams
1. **Prediction Markets**: 2% fee on betting pools
2. **Skill Showcase**: Platform promotion fees
3. **Course NFTs**: 2.5% royalty on resales
4. **Marketplace**: 2.5% fee on all transactions

### User Incentives
1. **Video Uploads**: 0.01 CHZ per upload
2. **Fan Tokens**: Governance participation rewards
3. **Content Creation**: Course NFT sales revenue
4. **Trading**: Access to exclusive marketplace items

## Next Steps After Testing

1. **Update Contract Addresses**: Paste deployed addresses in admin panel
2. **Fund Contracts**: Send CHZ to contracts for reward payouts
3. **Create Real Content**: Replace test data with actual events
4. **Community Launch**: Invite users to start using platform
5. **Monitor Usage**: Track transactions and user engagement

## Troubleshooting

### Common Issues
- **Transaction Fails**: Check CHZ balance for gas fees
- **Contract Not Found**: Verify contract addresses are updated
- **Function Reverts**: Ensure admin permissions are set correctly

### Support Resources
- [Chiliz Documentation](https://docs.chiliz.com)
- [Testnet Explorer](https://testnet.chiliscan.com)
- [Thirdweb Dashboard](https://thirdweb.com/dashboard)

Your ChiliZ eSports Hub is now ready for comprehensive testing and user onboarding!