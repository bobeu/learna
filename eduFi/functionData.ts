// Mainnet contract configs
import claimReward42220 from "./contractsArtifacts/42220/claimReward.json";
import getVerificationStatus42220 from "./contractsArtifacts/42220/getVerificationStatus.json";
import getData42220 from "./contractsArtifacts/42220/getData.json";
import recordPoints42220 from "./contractsArtifacts/42220/recordPoints.json";
import sortWeeklyReward42220 from "./contractsArtifacts/42220/sortWeeklyReward.json";
import setUpCampaign42220 from "./contractsArtifacts/42220/setUpCampaign.json";
import setPermission42220 from "./contractsArtifacts/42220/setPermission.json";
import owner42220 from "./contractsArtifacts/42220/owner.json";
import setMinimumToken42220 from "./contractsArtifacts/42220/setMinimumToken.json";
import approve42220 from "./contractsArtifacts/42220/approve.json";
import pause42220 from "./contractsArtifacts/42220/pause.json";
import unpause42220 from "./contractsArtifacts/42220/unpause.json";
import allowance42220 from "./contractsArtifacts/42220/allowance.json";
import adjustCampaignValues42220 from "./contractsArtifacts/42220/adjustCampaignValues.json";
import isPermitted42220 from "./contractsArtifacts/42220/isPermitted.json";
import banOrUnbanUser42220 from "./contractsArtifacts/42220/banOrUnbanUser.json";
import configId42220 from "./contractsArtifacts/42220/configId.json";
import setConfigId42220 from "./contractsArtifacts/42220/setConfigId.json";
import setScope42220 from "./contractsArtifacts/42220/setScope.json";
import verify42220 from "./contractsArtifacts/42220/verify.json";
import balanceOf42220 from "./contractsArtifacts/42220/balanceOf.json";
import delegateTransaction42220 from "./contractsArtifacts/42220/delegateTransaction.json";

// Celo Sepolia contract configs
import claimReward11142220 from "./contractsArtifacts/11142220/claimReward.json";
import getVerificationStatus11142220 from "./contractsArtifacts/11142220/getVerificationStatus.json";
import getData11142220 from "./contractsArtifacts/11142220/getData.json";
import recordPoints11142220 from "./contractsArtifacts/11142220/recordPoints.json";
import sortWeeklyReward11142220 from "./contractsArtifacts/11142220/sortWeeklyReward.json";
import setUpCampaign11142220 from "./contractsArtifacts/11142220/setUpCampaign.json";
import setPermission11142220 from "./contractsArtifacts/11142220/setPermission.json";
import owner11142220 from "./contractsArtifacts/11142220/owner.json";
import setMinimumToken11142220 from "./contractsArtifacts/11142220/setMinimumToken.json";
import approve11142220 from "./contractsArtifacts/11142220/approve.json";
import pause11142220 from "./contractsArtifacts/11142220/pause.json";
import unpause11142220 from "./contractsArtifacts/11142220/unpause.json";
import allowance11142220 from "./contractsArtifacts/11142220/allowance.json";
import adjustCampaignValues11142220 from "./contractsArtifacts/11142220/adjustCampaignValues.json";
import isPermitted11142220 from "./contractsArtifacts/11142220/isPermitted.json";
import banOrUnbanUser11142220 from "./contractsArtifacts/11142220/banOrUnbanUser.json";
import configId11142220 from "./contractsArtifacts/11142220/configId.json";
import setConfigId11142220 from "./contractsArtifacts/11142220/setConfigId.json";
import setScope11142220 from "./contractsArtifacts/11142220/setScope.json";
import verify11142220 from "./contractsArtifacts/11142220/verify.json";
import balanceOf11142220 from "./contractsArtifacts/11142220/balanceOf.json";
import delegateTransaction11142220 from "./contractsArtifacts/11142220/delegateTransaction.json";

// Global data import
import globalData from "./contractsArtifacts/global.json";

const { chainIds, approvedFunctions } = globalData;

const functionData = [
    [
        { key: 'banOrUnbanUser', value: { ...banOrUnbanUser11142220} },
        { key: 'owner', value: { ...owner11142220} },
        { key: 'pause', value: { ...pause11142220} },
        { key: 'unpause', value: { ...unpause11142220} },
        { key: 'allowance', value: { ...allowance11142220} },
        { key: 'approve', value: { ...approve11142220} },
        { key: 'setUpCampaign', value: { ...setUpCampaign11142220} },
        { key: 'sortWeeklyReward', value: { ...sortWeeklyReward11142220} },
        { key: 'recordPoints', value: { ...recordPoints11142220} },
        { key: 'getData', value: { ...getData11142220} },
        { key: 'setMinimumToken', value: { ...setMinimumToken11142220} },
        { key: 'claimReward', value: { ...claimReward11142220} },
        { key: 'setPermission', value: { ...setPermission11142220} },
        { key: 'adjustCampaignValues', value: { ...adjustCampaignValues11142220} },
        { key: 'isPermitted', value: { ...isPermitted11142220} },
        { key: 'configId', value: { ...configId11142220} },
        { key: 'setConfigId', value: { ...setConfigId11142220} },
        { key: 'setScope', value: { ...setScope11142220} },
        { key: 'getVerificationStatus', value: { ...getVerificationStatus11142220} },
        { key: 'verify', value: { ...verify11142220} },
        { key: 'balanceOf', value: { ...balanceOf11142220} },
        { key: 'delegateTransaction', value: { ...delegateTransaction11142220} },
    ],
    [
        { key: 'banOrUnbanUser', value: { ...banOrUnbanUser42220} },
        { key: 'owner', value: { ...owner42220} },
        { key: 'pause', value: { ...pause42220} },
        { key: 'unpause', value: { ...unpause42220} },
        { key: 'allowance', value: { ...allowance42220} },
        { key: 'approve', value: { ...approve42220} },
        { key: 'setUpCampaign', value: { ...setUpCampaign42220} },
        { key: 'sortWeeklyReward', value: { ...sortWeeklyReward42220} },
        { key: 'recordPoints', value: { ...recordPoints42220} },
        { key: 'getData', value: { ...getData42220} },
        { key: 'setMinimumToken', value: { ...setMinimumToken42220} },
        { key: 'claimReward', value: { ...claimReward42220} },
        { key: 'setPermission', value: { ...setPermission42220} },
        { key: 'adjustCampaignValues', value: { ...adjustCampaignValues42220} },
        { key: 'isPermitted', value: { ...isPermitted42220} },
        { key: 'configId', value: { ...configId42220} },
        { key: 'setConfigId', value: { ...setConfigId42220} },
        { key: 'setScope', value: { ...setScope42220} },
        { key: 'getVerificationStatus', value: { ...getVerificationStatus42220} },
        { key: 'verify', value: { ...verify42220} },
        { key: 'balanceOf', value: { ...balanceOf42220} },
        { key: 'delegateTransaction', value: { ...delegateTransaction42220} },
    ],
];

/**
 * @dev Fetch contract data related to a specific chain and function. By default it fetches data for celo mainnet if
 * no chainId is provided.
 * @param functionName : Function name
 * @param chainId : Connected chainId
 * @returns Contract data
 */
export const getFunctionData = (functionName: string, chainId: number | undefined) => {
    let _chainId = chainId || 42220;
    if(!approvedFunctions.includes(functionName)) {
        throw new Error(`${functionName} not supported`);
    }
    const chainIndex = chainIds.indexOf(_chainId);
    // const found = functionData[0].filter(q => q.key.toLowerCase() === functionName.toLowerCase());
    const found = functionData[chainIndex].filter(q => q.key.toLowerCase() === functionName.toLowerCase());
    return found?.[0].value;
}