# ChiliZ eSports Hub - Manual Deployment Guide

## Browser-Based Deployment Process

Each deployment command opens a browser interface for MetaMask interaction.

### Step-by-Step Process:

1. **Run deployment command in terminal**
2. **Browser opens with Thirdweb deploy interface**
3. **Click "Deploy Now" button**
4. **MetaMask extension pops up**
5. **Review gas fees and approve transaction**
6. **Copy deployed contract address**

### Deployment Commands:

```bash
# Deploy PredictionMarket (Hardcoded Admin - RECOMMENDED)
npx thirdweb deploy contracts/PredictionMarketHardcoded.sol -k "$THIRDWEB_SECRET_KEY"
```

**When browser opens:**
- Network: Select **Chiliz Spicy Testnet**
- Constructor Arguments: **None needed** (admin hardcoded)
- Click **Deploy Now**
- Approve in MetaMask

**Alternative with Constructor Parameter:**
```bash
# Deploy PredictionMarket (Parametrized)
npx thirdweb deploy contracts/PredictionMarketSimple.sol -k "$THIRDWEB_SECRET_KEY"
```

**When browser opens:**
- Network: Select **Chiliz Spicy Testnet**
- Constructor Arguments: `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`
- Click **Deploy Now**
- Approve in MetaMask

```bash
# Deploy FanTokenDAO
npx thirdweb deploy contracts/FanTokenDAOSimple.sol -k "$THIRDWEB_SECRET_KEY"
```

**When browser opens:**
- Network: Select **Chiliz Spicy Testnet**
- Constructor Arguments: `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]`
- Click **Deploy Now**
- Approve in MetaMask

```bash
# Deploy SkillShowcase
npx thirdweb deploy contracts/SkillShowcaseSimple.sol -k "$THIRDWEB_SECRET_KEY"
```

**When browser opens:**
- Network: Select **Chiliz Spicy Testnet**
- Constructor Arguments: `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`
- Click **Deploy Now**
- Approve in MetaMask

```bash
# Deploy CourseNFT
npx thirdweb deploy contracts/CourseNFTSimple.sol -k "$THIRDWEB_SECRET_KEY"
```

**When browser opens:**
- Network: Select **Chiliz Spicy Testnet**
- Constructor Arguments: `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]`
- Click **Deploy Now**
- Approve in MetaMask

```bash
# Deploy Marketplace
npx thirdweb deploy contracts/MarketplaceSimple.sol -k "$THIRDWEB_SECRET_KEY"
```

**When browser opens:**
- Network: Select **Chiliz Spicy Testnet**
- Constructor Arguments: `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`
- Click **Deploy Now**
- Approve in MetaMask

### After Each Deployment:

1. **Copy the contract address** from the success page
2. **Save the address** for updating the constants file
3. **Proceed to next contract deployment**

### MetaMask Setup:

Ensure MetaMask is configured for **Chiliz Spicy Testnet**:
- **Network Name**: Chiliz Spicy Testnet
- **RPC URL**: https://spicy-rpc.chiliz.com/
- **Chain ID**: 88882
- **Currency Symbol**: CHZ
- **Block Explorer**: https://testnet.chiliscan.com/

### Gas Costs:
Each deployment typically costs **0.001-0.003 CHZ** in gas fees.

### After All Deployments:
Visit `/admin` to update contract addresses and test functionality.