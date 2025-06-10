import claimWeeklyReward from "./contractsData/claimWeeklyReward.json";
import getTippers from "./contractsData/getTippers.json";
import getUserData from "./contractsData/getUserData.json";
import recordPoints from "./contractsData/recordPoints.json";
import sortWeeklyReward from "./contractsData/sortWeeklyReward.json";
import tip from "./contractsData/tip.json";
import owner from "./contractsData/owner.json";
import unregisterUsersForWeeklyEarning from "./contractsData/unregisterUsersForWeeklyEarning.json";

const steps = [
    { key: 'unregisterUsersForWeeklyEarning', value: { ...unregisterUsersForWeeklyEarning} },
    { key: 'owner', value: { ...owner} },
    { key: 'tip', value: { ...tip} },
    { key: 'sortWeeklyReward', value: { ...sortWeeklyReward } },
    { key: 'registerUsersForWeeklyEarning ', value: { ...registerUsersForWeeklyEarning  } },
    { key: 'getUserData', value: { ...getUserData } },
    { key: 'getTippers', value: { ...getTippers } },
    { key: 'claimWeeklyReward', value: { ...claimWeeklyReward } },
];

export const getStepData = (functionName: string) => {
    const filtered = steps.filter(({key}) => key === functionName);
    return filtered[0].value;
}