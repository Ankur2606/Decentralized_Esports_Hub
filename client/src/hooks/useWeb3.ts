import { useState, useEffect } from 'react';
import { createThirdwebClient, getContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { useActiveAccount, useConnect } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { CONTRACT_ADDRESSES } from '../../../shared/constants';
import { 
  PREDICTION_MARKET_ABI, 
  FAN_TOKEN_DAO_ABI, 
  SKILL_SHOWCASE_ABI, 
  COURSE_NFT_ABI, 
  MARKETPLACE_ABI 
} from '../../../shared/abis';

// Chiliz Spicy Testnet configuration
const chilizSpicyTestnet = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpc: 'https://spicy-rpc.chiliz.com',
  blockExplorers: [
    {
      name: 'Chiliz Explorer',
      url: 'https://testnet.chiliscan.com',
    },
  ],
});

const client = createThirdwebClient({
  clientId: 'your-client-id'
});

export function useWeb3() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const account = useActiveAccount();
  const { connect } = useConnect();

  useEffect(() => {
    if (account) {
      setIsConnected(true);
      setUserAddress(account.address);
    } else {
      setIsConnected(false);
      setUserAddress('');
    }
  }, [account]);

  const connectWallet = async () => {
    try {
      const wallet = createWallet('io.metamask');
      await connect(async () => {
        await wallet.connect({
          client,
        });
        return wallet;
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const getContracts = () => {
    return {
      predictionMarket: getContract({
        client,
        chain: chilizSpicyTestnet,
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
      }),
      fanTokenDAO: getContract({
        client,
        chain: chilizSpicyTestnet,
        address: CONTRACT_ADDRESSES.FAN_TOKEN_DAO,
        abi: FAN_TOKEN_DAO_ABI,
      }),
      skillShowcase: getContract({
        client,
        chain: chilizSpicyTestnet,
        address: CONTRACT_ADDRESSES.SKILL_SHOWCASE,
        abi: SKILL_SHOWCASE_ABI,
      }),
      courseNFT: getContract({
        client,
        chain: chilizSpicyTestnet,
        address: CONTRACT_ADDRESSES.COURSE_NFT,
        abi: COURSE_NFT_ABI,
      }),
      marketplace: getContract({
        client,
        chain: chilizSpicyTestnet,
        address: CONTRACT_ADDRESSES.MARKETPLACE,
        abi: MARKETPLACE_ABI,
      }),
    };
  };

  return {
    isConnected,
    userAddress,
    account,
    connectWallet,
    getContracts,
    client,
    chain: chilizSpicyTestnet,
  };
}