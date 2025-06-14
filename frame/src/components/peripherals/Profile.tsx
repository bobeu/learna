import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import { Address, filterTransactionData, formatValue, mockProfile, Profile as ProfileType, toBN, TransactionCallback } from "../utilities";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import GenerateKey from "../transactions/GenerateKey";
import ClaimWeeklyReward from "../transactions/ClaimWeeklyReward";
import CollapsibleComponent from "./Collapsible";

function ProfileComponent({weekId} : {weekId: bigint}) {
    const [openDrawer, setDrawer] = React.useState<boolean>(false);

    const chainId = useChainId();
    const config = useConfig();
    const toggleDrawer = (arg:boolean) => setDrawer(arg);
    const { address, isConnected } = useAccount();
    const account = address as Address;
    const {  setmessage, setError } = useStorage();

    const handleClaim = () => setDrawer(true);

    const callback : TransactionCallback = (arg) => {
        if(arg.message) setmessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    // Build the transactions to run
    const { readTxObject } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getUserData', 'checkligibility'],
            callback
        });

        const learna = ca.Learna as Address;
        const readArgs = [[account, weekId], [weekId]];
        const addresses = [learna, learna];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: addresses[i],
                args: readArgs[i]
            }
        });
        return { readTxObject };
    }, [chainId, account, weekId, callback]);

    // Fetch user data 
    const { data } = useReadContracts({
        config,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
            refetchOnMount: 'always',

        }
    });

    const profile = data?.[0]?.result as ProfileType || mockProfile;
    const isElibigle = data?.[1]?.result as boolean;
    const disableClaimButton = profile?.claimed || !profile?.haskey || isElibigle;
    const { amountClaimedInERC20, amountClaimedInNative, haskey, passKey, points, totalQuizPerWeek } = profile;
    
    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <h3 className="font-semibold">{`Week ${weekId.toString()} data`}</h3>
            <div className="space-y-2">
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Total attempted quiz</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{totalQuizPerWeek || 0}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Points earned</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{points || 0}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">PassKey</h3>
                    { 
                        haskey? <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>
                            <AddressWrapper account={passKey} size={4} display={false} copyIconSize={'sm'} />
                        </h3> : <GenerateKey />
                    }
                </div> 
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Amount of GROW Token claimed</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{formatValue(amountClaimedInERC20?.toString()).toStr || '0'}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">{`Amount of Celo claimed`}</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{formatValue(amountClaimedInNative?.toString()).toStr || '0'}</h3>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col justify-center items-center space-y-2 bg-cyan-500/50 h-[150px] w-[150px] rounded-full text-xs">
                    <h3>Points earned</h3>
                    <h3 className="text-4xl">{`${points || 0}`}</h3>
                </div>
            </div>
            <div className="flex justify-center items-center gap-1 w-full">
                <Button disabled={disableClaimButton} onClick={handleClaim} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Claim</Button>
            </div>
            <ClaimWeeklyReward 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                weekId={weekId}
            />
        </MotionDisplayWrapper>
    );
}


export default function Profile() {
    const { weekId, setpath } = useStorage();
    const backToHome = () => setpath('home');

    const weekIds = React.useMemo(() => {
        const wkId = toBN(weekId.toString()).toNumber();
        const weekIds = [...Array(wkId === 0? 1 : wkId + 1).keys()];
        return weekIds;
    }, [weekId]);

    return(
        <div className="space-y-2">
            {
                weekIds.map((wkId) => (
                    <MotionDisplayWrapper 
                        key={wkId}
                        
                    >
                        <CollapsibleComponent
                            header={`Week ${wkId}`}
                            id={wkId}
                        >
                            <ProfileComponent weekId={BigInt(wkId)} />
                        </CollapsibleComponent>
                    </MotionDisplayWrapper>
                ))
            }
            <Button onClick={backToHome} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
        </div>
    )

}