import claimReward from "./contractsData/claimReward.json";
import getProfile from "./contractsData/getProfile.json";
import generateKey from "./contractsData/generateKey.json";
import getData from "./contractsData/getData.json";
import checkEligibility from "./contractsData/checkEligibility.json";
import recordPoints from "./contractsData/recordPoints.json";
import sortWeeklyReward from "./contractsData/sortWeeklyReward.json";
import setUpCampaign from "./contractsData/setUpCampaign.json";
import setAdmin from "./contractsData/setAdmin.json";
import hasPassKey from "./contractsData/hasPassKey.json";
import getAdminStatus from "./contractsData/getAdminStatus.json";
import owner from "./contractsData/owner.json";
import setMinimumToken from "./contractsData/setMinimumToken.json";
import approve from "./contractsData/approve.json";
import setTransitionInterval from "./contractsData/setTransitionInterval.json";
import banUserFromCampaign from "./contractsData/banUserFromCampaign.json";
import adjustCampaignValues from "./contractsData/adjustCampaignValues.json";

const steps = [
    { key: 'banUserFromCampaign', value: { ...banUserFromCampaign} },
    { key: 'owner', value: { ...owner} },
    { key: 'approve', value: { ...approve} },
    { key: 'setUpCampaign', value: { ...setUpCampaign} },
    { key: 'sortWeeklyReward', value: { ...sortWeeklyReward } },
    { key: 'recordPoints', value: { ...recordPoints  } },
    { key: 'getProfile', value: { ...getProfile } },
    { key: 'generateKey', value: { ...generateKey } },
    { key: 'getData', value: { ...getData } },
    { key: 'setMinimumToken', value: { ...setMinimumToken } },
    { key: 'checkEligibility', value: { ...checkEligibility } },
    { key: 'claimReward', value: { ...claimReward } },
    { key: 'setAdmin', value: { ...setAdmin } },
    { key: 'getAdminStatus', value: { ...getAdminStatus } },
    { key: 'hasPassKey', value: { ...hasPassKey } },
    { key: 'setTransitionInterval', value: { ...setTransitionInterval } },
    { key: 'adjustCampaignValues', value: { ...adjustCampaignValues } },
];

export const getStepData = (functionName: string) => {
    const filtered = steps.filter(({key}) => key === functionName);
    // console.log("functionName", functionName)
    return filtered?.[0]?.value;
}