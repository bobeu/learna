import claimWeeklyReward from "./contractsData/claimWeeklyReward.json";
import getUserData from "./contractsData/getUserData.json";
import generateKey from "./contractsData/generateKey.json";
import getData from "./contractsData/getData.json";
import checkligibility from "./contractsData/checkligibility.json";
import recordPoints from "./contractsData/recordPoints.json";
import sortWeeklyReward from "./contractsData/sortWeeklyReward.json";
import tip from "./contractsData/tip.json";
import owner from "./contractsData/owner.json";
import removeUsersForWeeklyEarning from "./contractsData/removeUsersForWeeklyEarning.json";

const steps = [
    { key: 'removeUsersForWeeklyEarning', value: { ...removeUsersForWeeklyEarning} },
    { key: 'owner', value: { ...owner} },
    { key: 'tip', value: { ...tip} },
    { key: 'sortWeeklyReward', value: { ...sortWeeklyReward } },
    { key: 'recordPoints', value: { ...recordPoints  } },
    { key: 'getUserData', value: { ...getUserData } },
    { key: 'generateKey', value: { ...generateKey } },
    { key: 'getData', value: { ...getData } },
    { key: 'checkligibility', value: { ...checkligibility } },
    { key: 'claimWeeklyReward', value: { ...claimWeeklyReward } },
];

export const getStepData = (functionName: string) => {
    const filtered = steps.filter(({key}) => key === functionName);
    // console.log("functionName", functionName)
    return filtered?.[0]?.value;
}