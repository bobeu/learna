import { HardhatRuntimeEnvironment, } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import { parseEther, zeroAddress } from 'viem';

dotconfig();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
	const {deploy, execute, read, getNetworkName } = deployments;
	let {deployer, baseContributionAsset } = await getNamedAccounts();

	
}
export default func;

func.tags = ["RoleBase", "supportAssetManger", "SimpliToken", "Reserve", "FlexpoolFactory", "Points", "Providers", "Attorney", "TokenDistributor", "SafeFactory", "Escape"];
