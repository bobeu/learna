// Mainnet contract configs
import owner42220 from "./contractsArtifacts/42220/owner.json";
import setCreationFee42220 from "./contractsArtifacts/42220/setCreationFee.json";
import panicWithdraw42220 from "./contractsArtifacts/42220/panicWithdraw.json";
import withdraw42220 from "./contractsArtifacts/42220/withdraw.json";
import setFeeTo42220 from "./contractsArtifacts/42220/setFeeTo.json";
import getFactoryData42220 from "./contractsArtifacts/42220/getFactoryData.json";
import getInterfacerData42220 from "./contractsArtifacts/42220/getInterfacerData.json";
import setVerifier42220 from "./contractsArtifacts/42220/setVerifier.json";
import setApprovalFactory42220 from "./contractsArtifacts/42220/setApprovalFactory.json";
import createCampaign42220 from "./contractsArtifacts/42220/createCampaign.json";
import getUserCampaigns42220 from "./contractsArtifacts/42220/getUserCampaigns.json";
import verify42220 from "./contractsArtifacts/42220/verify.json";
import hasApproval42220 from "./contractsArtifacts/42220/hasApproval.json";
import removeApproval42220 from "./contractsArtifacts/42220/removeApproval.json";
import setApproval42220 from "./contractsArtifacts/42220/setApproval.json";
import setFactory42220 from "./contractsArtifacts/42220/setFactory.json";
import getFactory42220 from "./contractsArtifacts/42220/getFactory.json";
import banOrUnbanUser42220 from "./contractsArtifacts/42220/banOrUnbanUser.json";
import getVerificationStatus42220 from "./contractsArtifacts/42220/getVerificationStatus.json";
import toggleUseWalletVerification42220 from "./contractsArtifacts/42220/toggleUseWalletVerification.json";
import addFund42220 from "./contractsArtifacts/42220/addFund.json";
import approveIntegration42220 from "./contractsArtifacts/42220/approveIntegration.json";
import claimRewardForPOINT42220 from "./contractsArtifacts/42220/claimRewardForPOINT.json";
import claimRewardForPOASS42220 from "./contractsArtifacts/42220/claimRewardForPOASS.json";
import editMetaData42220 from "./contractsArtifacts/42220/editMetaData.json";
import epochSetting42220 from "./contractsArtifacts/42220/epochSetting.json";
import proveAssimilation42220 from "./contractsArtifacts/42220/proveAssimilation.json";
import setNewOwner42220 from "./contractsArtifacts/42220/setNewOwner.json";
import submitProofOfIntegration42220 from "./contractsArtifacts/42220/submitProofOfIntegration.json";
import pause42220 from "./contractsArtifacts/42220/pause.json";
import unpause42220 from "./contractsArtifacts/42220/unpause.json";
import isVerified42220 from "./contractsArtifacts/42220/isVerified.json";

// Celo Sepolia contract configs
import owner11142220 from "./contractsArtifacts/11142220/owner.json";
import setCreationFee11142220 from "./contractsArtifacts/11142220/setCreationFee.json";
import panicWithdraw11142220 from "./contractsArtifacts/11142220/panicWithdraw.json";
import withdraw11142220 from "./contractsArtifacts/11142220/withdraw.json";
import setFeeTo11142220 from "./contractsArtifacts/11142220/setFeeTo.json";
import getFactoryData11142220 from "./contractsArtifacts/11142220/getFactoryData.json";
// import getCampaignData11142220 from "./contractsArtifacts/11142220/getCampaignData.json";
import getInterfacerData11142220 from "./contractsArtifacts/11142220/getInterfacerData.json";
import setVerifier11142220 from "./contractsArtifacts/11142220/setVerifier.json";
import setApprovalFactory11142220 from "./contractsArtifacts/11142220/setApprovalFactory.json";
import createCampaign11142220 from "./contractsArtifacts/11142220/createCampaign.json";
import getUserCampaigns11142220 from "./contractsArtifacts/11142220/getUserCampaigns.json";
import verify11142220 from "./contractsArtifacts/11142220/verify.json";
import hasApproval11142220 from "./contractsArtifacts/11142220/hasApproval.json";
import removeApproval11142220 from "./contractsArtifacts/11142220/removeApproval.json";
import setApproval11142220 from "./contractsArtifacts/11142220/setApproval.json";
import setFactory11142220 from "./contractsArtifacts/11142220/setFactory.json";
import getFactory11142220 from "./contractsArtifacts/11142220/getFactory.json";
import banOrUnbanUser11142220 from "./contractsArtifacts/11142220/banOrUnbanUser.json";
import getVerificationStatus11142220 from "./contractsArtifacts/11142220/getVerificationStatus.json";
import toggleUseWalletVerification11142220 from "./contractsArtifacts/11142220/toggleUseWalletVerification.json";
import addFund11142220 from "./contractsArtifacts/11142220/addFund.json";
import approveIntegration11142220 from "./contractsArtifacts/11142220/approveIntegration.json";
import claimRewardForPOINT11142220 from "./contractsArtifacts/11142220/claimRewardForPOINT.json";
import claimRewardForPOASS11142220 from "./contractsArtifacts/11142220/claimRewardForPOASS.json";
import editMetaData11142220 from "./contractsArtifacts/11142220/editMetaData.json";
import epochSetting11142220 from "./contractsArtifacts/11142220/epochSetting.json";
import proveAssimilation11142220 from "./contractsArtifacts/11142220/proveAssimilation.json";
import setNewOwner11142220 from "./contractsArtifacts/11142220/setNewOwner.json";
import submitProofOfIntegration11142220 from "./contractsArtifacts/11142220/submitProofOfIntegration.json";
import pause11142220 from "./contractsArtifacts/11142220/pause.json";
import unpause11142220 from "./contractsArtifacts/11142220/unpause.json";
import isVerified11142220 from "./contractsArtifacts/11142220/isVerified.json";

// 'owner', 'getData', 'hasApproval', 'isVerified', 'getData'
// Global data import
import globalData from "./contractsArtifacts/global.json";

const { chainIds, approvedFunctions } = globalData;

const functionData = [
    [
        { key: 'banOrUnbanUser', value: { ...banOrUnbanUser11142220} },
        { key: 'setFeeTo', value: { ...setFeeTo11142220} },
        { key: 'getFactoryData', value: { ...getFactoryData11142220} },
        { key: 'setVerifier', value: { ...setVerifier11142220} },
        { key: 'setApprovalFactory', value: { ...setApprovalFactory11142220} },
        { key: 'createCampaign', value: { ...createCampaign11142220} },
        { key: 'getUserCampaigns', value: { ...getUserCampaigns11142220} },
        { key: 'hasApproval', value: { ...hasApproval11142220} },
        { key: 'removeApproval', value: { ...removeApproval11142220} },
        { key: 'getInterfacerData', value: { ...getInterfacerData11142220} },
        { key: 'setApproval', value: { ...setApproval11142220} },
        { key: 'setFactory', value: { ...setFactory11142220} },
        { key: 'getFactory', value: { ...getFactory11142220} },
        { key: 'toggleUseWalletVerification', value: { ...toggleUseWalletVerification11142220} },
        { key: 'getVerificationStatus', value: { ...getVerificationStatus11142220} },
        { key: 'verify', value: { ...verify11142220} },
        { key: 'panicWithdraw', value: { ...panicWithdraw11142220} },
        { key: 'withdraw', value: { ...withdraw11142220} },
        { key: 'setCreationFee', value: { ...setCreationFee11142220} },
        { key: 'owner', value: { ...owner11142220} },
        { key: 'addFund', value: { ...addFund11142220} },
        { key: 'approveIntegration', value: { ...approveIntegration11142220} },
        { key: 'claimRewardForPOASS', value: { ...claimRewardForPOASS11142220} },
        { key: 'claimRewardForPOINT', value: { ...claimRewardForPOINT11142220} },
        { key: 'editMetaData', value: { ...editMetaData11142220} },
        { key: 'epochSetting', value: { ...epochSetting11142220} },
        { key: 'pause', value: { ...pause11142220} },
        { key: 'unpause', value: { ...unpause11142220} },
        { key: 'proveAssimilation', value: { ...proveAssimilation11142220} },
        { key: 'setNewOwner', value: { ...setNewOwner11142220} },
        { key: 'submitProofOfIntegration', value: { ...submitProofOfIntegration11142220} },
        { key: 'isVerified', value: { ...isVerified11142220} },
    ],
    [
        { key: 'banOrUnbanUser', value: { ...banOrUnbanUser42220} },
        { key: 'setFeeTo', value: { ...setFeeTo42220} },
        { key: 'getFactoryData', value: { ...getFactoryData42220} },
        { key: 'setVerifier', value: { ...setVerifier42220} },
        { key: 'setApprovalFactory', value: { ...setApprovalFactory42220} },
        { key: 'createCampaign', value: { ...createCampaign42220} },
        { key: 'getUserCampaigns', value: { ...getUserCampaigns42220} },
        { key: 'hasApproval', value: { ...hasApproval42220} },
        { key: 'removeApproval', value: { ...removeApproval42220} },
        { key: 'getInterfacerData', value: { ...getInterfacerData42220} },
        { key: 'setApproval', value: { ...setApproval42220} },
        { key: 'setFactory', value: { ...setFactory42220} },
        { key: 'getFactory', value: { ...getFactory42220} },
        { key: 'toggleUseWalletVerification', value: { ...toggleUseWalletVerification42220} },
        { key: 'getVerificationStatus', value: { ...getVerificationStatus42220} },
        { key: 'verify', value: { ...verify42220} },
        { key: 'panicWithdraw', value: { ...panicWithdraw42220} },
        { key: 'withdraw', value: { ...withdraw42220} },
        { key: 'setCreationFee', value: { ...setCreationFee42220} },
        { key: 'owner', value: { ...owner42220} },
        { key: 'addFund', value: { ...addFund42220} },
        { key: 'approveIntegration', value: { ...approveIntegration42220} },
        { key: 'claimRewardForPOASS', value: { ...claimRewardForPOASS42220} },
        { key: 'claimRewardForPOINT', value: { ...claimRewardForPOINT42220} },
        { key: 'editMetaData', value: { ...editMetaData42220} },
        { key: 'epochSetting', value: { ...epochSetting42220} },
        { key: 'pause', value: { ...pause42220} },
        { key: 'unpause', value: { ...unpause42220} },
        { key: 'proveAssimilation', value: { ...proveAssimilation42220} },
        { key: 'setNewOwner', value: { ...setNewOwner42220} },
        { key: 'submitProofOfIntegration', value: { ...submitProofOfIntegration42220} },
        { key: 'isVerified', value: { ...isVerified42220} },
    ],
];

/**
 * @dev Fetch contract data related to a specific chain and function. By default it fetches data for celo mainnet if
 * no chainId is provided.
 * @param functionName : Function name
 * @param chainId : Connected chainId
 * @returns Contract data
 */
export const getFunctionData = (functionName: string, chainIndex: number) => {
    if(!approvedFunctions.includes(functionName)) {
        throw new Error(`${functionName} not supported`);
    }
    const found = functionData[chainIndex].filter(q => q.key.toLowerCase() === functionName.toLowerCase());
    return found?.[0]?.value;
}