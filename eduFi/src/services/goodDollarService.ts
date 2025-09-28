/* eslint-disable */

import { ethers } from 'ethers';
import { Address } from '../../types';

// GoodDollar SDK Integration Service
// This service handles integration with GoodDollar protocol for earning G$ tokens

export interface GoodDollarConfig {
  rpcUrl: string;
  goodDollarContractAddress: Address;
  campaignContractAddress: Address;
  privateKey?: string;
}

export interface GoodDollarReward {
  amount: string;
  tokenAddress: Address;
  transactionHash?: string;
  status: 'pending' | 'success' | 'failed';
}

export interface GoodDollarUser {
  address: Address;
  balance: string;
  isRegistered: boolean;
  canClaim: boolean;
}

class GoodDollarService {
  private config: GoodDollarConfig;
  private provider?: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(config: GoodDollarConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      
      if (this.config.privateKey) {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
      }
    } catch (error) {
      console.error('Failed to initialize GoodDollar provider:', error);
    }
  }

  /**
   * Initialize with user's wallet provider
   */
  async initializeWithWallet(walletProvider: any) {
    try {
      this.provider = walletProvider;
      this.signer = await walletProvider.getSigner();
      return true;
    } catch (error) {
      console.error('Failed to initialize with wallet:', error);
      return false;
    }
  }

  /**
   * Check if user is registered with GoodDollar
   */
  async isUserRegistered(userAddress: Address): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // GoodDollar contract ABI for checking user registration
      const contract = new ethers.Contract(
        this.config.goodDollarContractAddress,
        [
          'function isRegistered(address user) view returns (bool)',
          'function balanceOf(address account) view returns (uint256)',
          'function canClaim(address user) view returns (bool)'
        ],
        this.provider
      );

      const isRegistered = await contract.isRegistered(userAddress);
      return isRegistered;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }

  /**
   * Get user's GoodDollar balance
   */
  async getUserBalance(userAddress: Address): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(
        this.config.goodDollarContractAddress,
        ['function balanceOf(address account) view returns (uint256)'],
        this.provider
      );

      const balance = await contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting user balance:', error);
      return '0';
    }
  }

  /**
   * Check if user can claim GoodDollar rewards
   */
  async canUserClaim(userAddress: Address): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(
        this.config.goodDollarContractAddress,
        ['function canClaim(address user) view returns (bool)'],
        this.provider
      );

      const canClaim = await contract.canClaim(userAddress);
      return canClaim;
    } catch (error) {
      console.error('Error checking claim eligibility:', error);
      return false;
    }
  }

  /**
   * Get comprehensive user information
   */
  async getUserInfo(userAddress: Address): Promise<GoodDollarUser> {
    const [isRegistered, balance, canClaim] = await Promise.all([
      this.isUserRegistered(userAddress),
      this.getUserBalance(userAddress),
      this.canUserClaim(userAddress)
    ]);

    return {
      address: userAddress,
      balance,
      isRegistered,
      canClaim
    };
  }

  /**
   * Register user with GoodDollar (if not already registered)
   */
  async registerUser(userAddress: Address): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      const contract = new ethers.Contract(
        this.config.goodDollarContractAddress,
        [
          'function register() external',
          'function isRegistered(address user) view returns (bool)'
        ],
        this.signer
      );

      // Check if already registered
      const isRegistered = await contract.isRegistered(userAddress);
      if (isRegistered) {
        return { success: true, error: 'User already registered' };
      }

      // Register user
      const tx = await contract.register();
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Claim GoodDollar rewards for campaign participation
   */
  async claimCampaignRewards(
    userAddress: Address, 
    campaignId: string, 
    epochIndex: number
  ): Promise<{ success: boolean; reward?: GoodDollarReward; error?: string }> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      // First, ensure user is registered
      const isRegistered = await this.isUserRegistered(userAddress);
      if (!isRegistered) {
        const registration = await this.registerUser(userAddress);
        if (!registration.success) {
          return { success: false, error: 'Failed to register user' };
        }
      }

      // Check if user can claim
      const canClaim = await this.canUserClaim(userAddress);
      if (!canClaim) {
        return { success: false, error: 'User cannot claim rewards at this time' };
      }

      // Claim rewards through campaign contract
      const campaignContract = new ethers.Contract(
        this.config.campaignContractAddress,
        [
          'function claimGoodDollarReward(address user, uint256 epochIndex) external returns (uint256)',
          'function hasParticipatedInEpoch(address user, uint256 epochIndex) view returns (bool)'
        ],
        this.signer
      );

      // Verify user participated in the epoch
      const hasParticipated = await campaignContract.hasParticipatedInEpoch(userAddress, epochIndex);
      if (!hasParticipated) {
        return { success: false, error: 'User has not participated in this epoch' };
      }

      // Claim the reward
      const tx = await campaignContract.claimGoodDollarReward(userAddress, epochIndex);
      const receipt = await tx.wait();

      // Get the reward amount from the transaction logs
      const rewardAmount = receipt.logs[0]?.args?.amount || '0';

      return {
        success: true,
        reward: {
          amount: ethers.formatEther(rewardAmount),
          tokenAddress: this.config.goodDollarContractAddress,
          transactionHash: tx.hash,
          status: 'success'
        }
      };
    } catch (error: any) {
      console.error('Error claiming GoodDollar rewards:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get GoodDollar token information
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(
        this.config.goodDollarContractAddress,
        [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function totalSupply() view returns (uint256)'
        ],
        this.provider
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  /**
   * Calculate potential GoodDollar rewards for a user
   */
  async calculatePotentialRewards(
    userAddress: Address,
    campaignId: string,
    epochIndex: number
  ): Promise<{
    estimatedReward: string;
    canClaim: boolean;
    requirements: string[];
  }> {
    try {
      // const [userInfo, tokenInfo] = await Promise.all([
      const [userInfo] = await Promise.all([
        this.getUserInfo(userAddress),
        this.getTokenInfo()
      ]);

      const requirements: string[] = [];
      
      if (!userInfo.isRegistered) {
        requirements.push('User must be registered with GoodDollar');
      }
      
      if (!userInfo.canClaim) {
        requirements.push('User must be eligible to claim rewards');
      }

      // This is a simplified calculation - in reality, this would depend on
      // the campaign's specific reward structure and user's participation level
      const estimatedReward = userInfo.canClaim ? '10.0' : '0.0';

      return {
        estimatedReward,
        canClaim: userInfo.canClaim && userInfo.isRegistered,
        requirements
      };
    } catch (error) {
      console.error('Error calculating potential rewards:', error);
      return {
        estimatedReward: '0.0',
        canClaim: false,
        requirements: ['Error calculating rewards']
      };
    }
  }
}

// Export singleton instance
export const goodDollarService = new GoodDollarService({
  rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
  goodDollarContractAddress: process.env.NEXT_PUBLIC_GOODDOLLAR_CONTRACT_ADDRESS as Address || '0x0000000000000000000000000000000000000000',
  campaignContractAddress: process.env.NEXT_PUBLIC_CAMPAIGN_CONTRACT_ADDRESS as Address || '0x0000000000000000000000000000000000000000'
});

export default goodDollarService;
