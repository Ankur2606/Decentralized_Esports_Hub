// ChiliZ eSports Hub - Admin Test Functions
// Run these after contract deployment to create test content

export class AdminTester {
  constructor(web3Service) {
    this.web3 = web3Service;
    this.adminAddress = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";
  }

  // 1. Prediction Market Tests
  async createTestEvent() {
    console.log("Creating test betting event...");
    try {
      const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txHash = await this.web3.createEvent(
        "Team A vs Team B - Valorant Championship",
        "QmTestEventHash123", // Replace with actual IPFS hash
        endTime
      );
      console.log("✓ Test event created, txHash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Failed to create event:", error);
    }
  }

  async fundSkillShowcase() {
    console.log("Funding SkillShowcase contract for rewards...");
    // This would send CHZ to the contract for creator rewards
    console.log("Send 1 CHZ to SkillShowcase contract address");
  }

  // 2. DAO Tests
  async mintTestTokens(userAddress, amount = "100") {
    console.log(`Minting ${amount} fan tokens to ${userAddress}...`);
    try {
      const txHash = await this.web3.mintFanTokens(userAddress, amount);
      console.log("✓ Tokens minted, txHash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Failed to mint tokens:", error);
    }
  }

  // 3. Course NFT Tests
  async createTestCourse() {
    console.log("Creating test course NFT...");
    try {
      const txHash = await this.web3.lazyMintCourse(
        "QmTestCourseHash456", // Replace with actual IPFS hash
        "0.1" // 0.1 CHZ price
      );
      console.log("✓ Test course created, txHash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Failed to create course:", error);
    }
  }

  // 4. Full Test Suite
  async runFullTestSuite() {
    console.log("🧪 Running full admin test suite...");
    
    console.log("\n1. Testing Prediction Market...");
    await this.createTestEvent();
    
    console.log("\n2. Testing DAO Tokens...");
    await this.mintTestTokens(this.adminAddress);
    
    console.log("\n3. Testing Course NFTs...");
    await this.createTestCourse();
    
    console.log("\n4. Funding contracts...");
    await this.fundSkillShowcase();
    
    console.log("\n✅ Admin test suite completed!");
    console.log("\nNext steps:");
    console.log("- Users can now place bets on the test event");
    console.log("- Users can upload videos and earn rewards");
    console.log("- DAO token holders can create and vote on proposals");
    console.log("- Users can purchase the test course");
  }
}

// Usage example:
// const tester = new AdminTester(web3Service);
// await tester.runFullTestSuite();
