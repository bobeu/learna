import claimReward44787 from "./contractsArtifacts/claimReward44787.json";
import getProfile44787 from "./contractsArtifacts/getProfile44787.json";
import generateKey44787 from "./contractsArtifacts/generateKey44787.json";
import getData44787 from "./contractsArtifacts/getData44787.json";
import checkEligibility44787 from "./contractsArtifacts/checkEligibility44787.json";
import recordPoints44787 from "./contractsArtifacts/recordPoints44787.json";
import sortWeeklyReward44787 from "./contractsArtifacts/sortWeeklyReward44787.json";
import setUpCampaign44787 from "./contractsArtifacts/setUpCampaign44787.json";
import setAdmin44787 from "./contractsArtifacts/setAdmin44787.json";
import hasPassKey44787 from "./contractsArtifacts/hasPassKey44787.json";
import getAdminStatus44787 from "./contractsArtifacts/getAdminStatus44787.json";
import owner44787 from "./contractsArtifacts/owner44787.json";
import setMinimumToken44787 from "./contractsArtifacts/setMinimumToken44787.json";
import approve44787 from "./contractsArtifacts/approve44787.json";
import allowance44787 from "./contractsArtifacts/allowance44787.json";
import setTransitionInterval44787 from "./contractsArtifacts/setTransitionInterval44787.json";
import banUserFromCampaign44787 from "./contractsArtifacts/banUserFromCampaign44787.json";
import adjustCampaignValues44787 from "./contractsArtifacts/adjustCampaignValues44787.json";
import getCampaingData44787 from "./contractsArtifacts/getCampaingData44787.json";

// import claimReward from "./contractsArtifacts/claimReward42220.json";
// import getProfile from "./contractsArtifacts/getProfile42220.json";
import generateKey42220 from "./contractsArtifacts/generateKey42220.json";
import getData42220 from "./contractsArtifacts/getData42220.json";
// import checkEligibility42220 from "./contractsArtifacts/checkEligibility42220.json";
import recordPoints42220 from "./contractsArtifacts/recordPoints42220.json";
import sortWeeklyReward42220 from "./contractsArtifacts/sortWeeklyReward42220.json";
// import setUpCampaign42220 from "./contractsArtifacts/setUpCampaign42220.json";
import setAdmin42220 from "./contractsArtifacts/setAdmin42220.json";
import hasPassKey42220 from "./contractsArtifacts/hasPassKey42220.json";
// import getAdminStatus42220 from "./contractsArtifacts/getAdminStatus42220.json";
import owner42220 from "./contractsArtifacts/owner42220.json";
import setMinimumToken42220 from "./contractsArtifacts/setMinimumToken42220.json";
import approve42220 from "./contractsArtifacts/approve42220.json";
import allowance42220 from "./contractsArtifacts/allowance42220.json";
import setTransitionInterval42220 from "./contractsArtifacts/setTransitionInterval42220.json";
// import banUserFromCampaign from "./contractsArtifacts/banUserFromCampaign42220.json";
// import adjustCampaignValues from "./contractsArtifacts/adjustCampaignValues42220.json";
// import getCampaingData from "./contractsArtifacts/getCampaingData42220.json";

const steps = [
    { key: 'banUserFromCampaign44787', value: { ...banUserFromCampaign44787} },
    { key: 'owner44787', value: { ...owner44787} },
    { key: 'allowance44787', value: { ...allowance44787} },
    { key: 'approve44787', value: { ...approve44787} },
    { key: 'setUpCampaign44787', value: { ...setUpCampaign44787} },
    { key: 'sortWeeklyReward44787', value: { ...sortWeeklyReward44787} },
    { key: 'recordPoints44787', value: { ...recordPoints44787} },
    { key: 'getProfile44787', value: { ...getProfile44787} },
    { key: 'generateKey44787', value: { ...generateKey44787} },
    { key: 'getData44787', value: { ...getData44787} },
    { key: 'setMinimumToken44787', value: { ...setMinimumToken44787} },
    { key: 'checkEligibility44787', value: { ...checkEligibility44787} },
    { key: 'claimReward44787', value: { ...claimReward44787} },
    { key: 'setAdmin44787', value: { ...setAdmin44787} },
    { key: 'getAdminStatus44787', value: { ...getAdminStatus44787} },
    { key: 'hasPassKey44787', value: { ...hasPassKey44787} },
    { key: 'setTransitionInterval44787', value: { ...setTransitionInterval44787} },
    { key: 'adjustCampaignValues44787', value: { ...adjustCampaignValues44787} },
    { key: 'getCampaingData44787', value: { ...getCampaingData44787} },

    // { key: 'banUserFromCampaign', value: { ...banUserFromCampaign42220} },
    { key: 'owner', value: { ...owner42220} },
    { key: 'allowance', value: { ...allowance42220} },
    { key: 'approve', value: { ...approve42220} },
    // { key: 'setUpCampaign', value: { ...setUpCampaign42220} },
    { key: 'sortWeeklyReward', value: { ...sortWeeklyReward42220} },
    { key: 'recordPoints', value: { ...recordPoints42220} },
    // { key: 'getProfile', value: { ...getProfile42220} },
    { key: 'generateKey', value: { ...generateKey42220} },
    { key: 'getData', value: { ...getData42220} },
    { key: 'setMinimumToken', value: { ...setMinimumToken42220} },
    // { key: 'checkEligibility', value: { ...checkEligibility42220} },
    // { key: 'claimReward', value: { ...claimReward42220} },
    { key: 'setAdmin', value: { ...setAdmin42220} },
    // { key: 'getAdminStatus', value: { ...getAdminStatus42220} },
    { key: 'hasPassKey', value: { ...hasPassKey42220} },
    { key: 'setTransitionInterval', value: { ...setTransitionInterval42220} },
//     { key: 'adjustCampaignValues', value: { ...adjustCampaignValues42220} },
//     { key: 'getCampaingData', value: { ...getCampaingData42220} },
];

export const getStepData = (functionName: string) => {
    const filtered = steps.filter(({key}) => key === functionName);
    // console.log("functionName", functionName)
    return filtered?.[0]?.value;
}