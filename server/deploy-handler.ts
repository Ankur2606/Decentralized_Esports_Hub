import { spawn } from 'child_process';

const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

interface ContractConfig {
  name: string;
  file: string;
  constructorArgs: string[];
}

const CONTRACTS: ContractConfig[] = [
  {
    name: "PredictionMarket",
    file: "contracts/PredictionMarketSimple.sol",
    constructorArgs: [ADMIN_ADDRESS]
  },
  {
    name: "FanTokenDAO",
    file: "contracts/FanTokenDAOSimple.sol", 
    constructorArgs: [ADMIN_ADDRESS, "ChiliZ Fan Token", "FTK"]
  },
  {
    name: "SkillShowcase",
    file: "contracts/SkillShowcaseSimple.sol",
    constructorArgs: [ADMIN_ADDRESS]
  },
  {
    name: "CourseNFT",
    file: "contracts/CourseNFTSimple.sol",
    constructorArgs: [ADMIN_ADDRESS, "ChiliZ Course NFT", "COURSE", ADMIN_ADDRESS, "250"]
  },
  {
    name: "Marketplace",
    file: "contracts/MarketplaceSimple.sol",
    constructorArgs: [ADMIN_ADDRESS]
  }
];

export class ContractDeployer {
  private deployedContracts: Map<string, string> = new Map();

  async deployContract(contract: ContractConfig): Promise<{ success: boolean; address?: string; error?: string }> {
    return new Promise((resolve) => {
      console.log(`Deploying ${contract.name}...`);
      
      const args = JSON.stringify(contract.constructorArgs);
      console.log(`Constructor args: ${args}`);
      
      const process = spawn('npx', [
        'thirdweb',
        'deploy', 
        contract.file,
        '-k',
        process.env.THIRDWEB_SECRET_KEY || '',
        '--constructor-args',
        args,
        '--network',
        'chiliz-spicy-testnet'
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`${contract.name} stdout:`, data.toString());
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log(`${contract.name} stderr:`, data.toString());
      });

      process.on('close', (code) => {
        if (code === 0) {
          // Parse deployment output for contract address
          const addressMatch = output.match(/0x[a-fA-F0-9]{40}/);
          const address = addressMatch ? addressMatch[0] : '';
          
          if (address) {
            this.deployedContracts.set(contract.name, address);
            console.log(`✅ ${contract.name} deployed at: ${address}`);
            resolve({ success: true, address });
          } else {
            console.log(`❌ ${contract.name} deployment failed: No address found`);
            resolve({ success: false, error: 'No contract address found in output' });
          }
        } else {
          console.log(`❌ ${contract.name} deployment failed with code ${code}`);
          resolve({ success: false, error: errorOutput || `Process exited with code ${code}` });
        }
      });

      process.on('error', (error) => {
        console.error(`Error deploying ${contract.name}:`, error);
        resolve({ success: false, error: error.message });
      });
    });
  }

  async deployAllContracts(): Promise<{ 
    success: boolean; 
    deployedContracts: Map<string, string>; 
    errors: string[] 
  }> {
    const errors: string[] = [];
    
    for (const contract of CONTRACTS) {
      const result = await this.deployContract(contract);
      
      if (!result.success) {
        errors.push(`${contract.name}: ${result.error}`);
      }
      
      // Add delay between deployments
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      success: errors.length === 0,
      deployedContracts: this.deployedContracts,
      errors
    };
  }

  getDeployedContracts(): Map<string, string> {
    return this.deployedContracts;
  }
}

export const contractDeployer = new ContractDeployer();