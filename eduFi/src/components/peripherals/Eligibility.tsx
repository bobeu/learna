/* eslint-disable */
import React from "react";
import { ClaimResult, Eligibility as Elg} from "../../../types/quiz";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import { LucideBox, Verified, Brackets, Coins, IdCard } from "lucide-react";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import { formatValue, mockClaimResult, mockEligibility } from "../utilities";
import { SelectComponent } from "./SelectComponent";
import { Hex } from "viem";

function Eligibility({eligibility : elg}: {eligibility: Elg}) {
    let eligibility : Elg = mockEligibility;
    if(!elg && elg !== undefined) eligibility = elg;
    const { campaignHash, erc20Amount, nativeAmount, protocolVerified, token, weekId } = eligibility || mockEligibility;
    const { campaignData } = useStorage();
    const myCampaign = campaignData?.filter(q => q.campaignHash.toLowerCase() === campaignHash?.toLowerCase());

    return(
        <MotionDisplayWrapper>
            <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <LucideBox className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-xl text-gray-800 mb-1">
                        {myCampaign?.[0]?.campaign ?? 'No Campaign'}
                    </div>
                    <div className="text-sm text-gray-600">Campaign</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Verified className={`w-8 h-8 ${protocolVerified? 'text-green-600' : 'text-orange-600'}`} />
                    </div>
                    <div className="text-xl text-gray-800 mb-1">
                        {protocolVerified? 'Verified' : 'No claim'}
                    </div>
                    <div className="text-sm text-gray-600">Protocol eligibility</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Brackets className={`w-8 h-8 text-blue-600`} /> 
                    </div>
                    <div className="text-xl text-gray-800 mb-1">
                        {weekId?.toString()}
                    </div>
                    <div className="text-sm text-gray-600">Week Id</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <IdCard className={`w-8 h-8 text-blue-600`} /> 
                    </div>
                    <div className="text-xl text-gray-800 mb-1">
                        <AddressWrapper 
                            account={token}
                            display={true}
                            size={3}
                        />
                    </div>
                    <div className="text-sm text-gray-600">Funded In</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Coins className={`w-8 h-8 text-blue-600`} /> 
                    </div>
                    <div className="text-xl text-gray-800 mb-1">
                       { formatValue(erc20Amount?.toString()).toStr }
                    </div>
                    <div className="text-sm text-gray-600">Reward In Token</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Coins className={`w-8 h-8 text-yellow-600`} /> 
                    </div>
                    <div className="text-xl text-gray-800 mb-1">
                       { formatValue(nativeAmount?.toString()).toStr }
                    </div>
                    <div className="text-sm text-gray-600">Reward In $CELO</div>
                </div>
            </div>
        </MotionDisplayWrapper>
    );
}

export default function Eligibiliies({eligibilities}: {eligibilities: ClaimResult[]}) {
    const [ requestedHash, setRequestedHash ] = React.useState<Hex>(`0x`);
    const [ requestedWkId, setWeekId ] = React.useState<string>('0');
    
    const { campaignStrings, campaignData, wkId } = useStorage();
    
    const setselectedWeek = (arg: string) => {
        setWeekId(arg);
    }

    const setHash = (arg: string) => {
        const found = campaignData.filter(q => q.campaign === arg);
        if(found.length > 0) setRequestedHash(found[0].campaignHash as Hex);
    }

    const { eligibility, weekIds } = React.useMemo(() => {
        const weekIds = Array.from({length: wkId + 1}, (_: number, i: number) => i).map(q => q.toString());
        const filteredByWk = eligibilities.filter(q => q.weekId.toString() === requestedWkId && q)?.[0]?? mockClaimResult;
        const eligibility = filteredByWk?.elgs?.filter(q => q.campaignHash.toLowerCase() === requestedHash.toLowerCase())?.[0]?? [mockEligibility]; 

        return { eligibility, weekIds };
    }, [eligibilities, requestedHash, wkId, requestedWkId]);
    
    return(
        <div className="font-mono grid grid-cols-1 gap-3">
            <div className="text-2xl text-left font-bold text-gray-800 mb-4">Reward Eligibility</div>
            <div className="flex justify-between gap-4 max-w-sm">
                <div className="w-2/4 text-start text-sm p-4 bg-white rounded-xl">
                    <h3 className="pl-2">Pick a Campaign</h3>
                    <SelectComponent 
                        setHash={setHash}
                        campaigns={campaignStrings}
                        placeHolder="Select campaign"
                        width="w-"
                    />
                </div>
                <div className="w-2/4 text-start text-sm p-4 bg-white rounded-xl">
                    <h3 className="pl-2">Week</h3>
                    <SelectComponent 
                        setHash={setselectedWeek}
                        campaigns={weekIds}
                        placeHolder="Select campaign"
                        width="w-"
                    />
                </div>
            </div>
            <div>
                <Eligibility 
                    eligibility={eligibility}
                />
            </div>
        </div>
    );
}