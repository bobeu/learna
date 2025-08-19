/* eslint-disable */
import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import { useChainId, } from "wagmi";
import { filterTransactionData, formatAddr } from "../utilities";
import { parseUnits, zeroAddress } from "viem";
import { Address, CampaignHashFormatted } from "../../../types/quiz";
import Wrapper2xl from "./Wrapper2xl";
import CustomButton from "./CustomButton";
import { Info, Award } from "lucide-react";
import SetUpCampaign from "../transactions/SetupCampaigns";
import { Input, InputTag } from "./inputs/Input";
import { ContentType } from "./inputs/SortWeeklyPayoutInfo";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "~/components/ui/select";

export function CampaignMap(
    {campaignData, setCampaign} : 
    {
        selectedCampaign: string; 
        campaignData: CampaignHashFormatted[];
        setCampaign: (data: CampaignHashFormatted) => void;
    }) 
{
    const onChange = (value: string) => {
        if(campaignData && campaignData.length > 0){
            const filtered : CampaignHashFormatted[] = campaignData.filter(({campaign}) => value === campaign);
            setCampaign(filtered?.[0]);
        } else {
            alert('Please check you connection.')
        }
    };

    return (
        <Select onValueChange={onChange}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue className="font-mono" placeholder={"Select campaign"} />
            </SelectTrigger>
            <SelectContent className="font-mono">
                <SelectGroup>
                <SelectLabel>Campaigns</SelectLabel>
                {
                    (campaignData && campaignData.length > 0)? campaignData?.map((data, index) => (
                        <SelectItem
                            key={data.campaign.concat(index.toString())} 
                            value={data.campaign} 
                            className="capitalize text-cyan-900"
                        >
                            {data.campaign}
                        </SelectItem>
                    )) : <h3 className="p-4 text-center">Please check your network</h3>
                }
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default function SetupCampaign() {
    const [ openDrawer, setDrawer ] = React.useState<number>(0);
    const [ celoAmount, setCeloAmount ] = React.useState<string>('0');
    const [ token, setToken ] = React.useState<{address: Address, name: string}>({address: zeroAddress, name: ''});
    const [ erc20Amount, setErc20Amount ] = React.useState<string>('0');
    const [ selectedCampaign, setCampaign ] = React.useState<string>('');

    const { setpath, campaignData } = useStorage();
    const toggleDrawer = (arg: number) => {
        setDrawer(arg);
    }
    const onValueChange = (arg: string) => {
        const filtered = contractAddresses.filter(({name}) => name === arg);
        setToken(filtered?.[0])
    };campaignData

    const backToDashboard = () => setpath('dashboard');
    const chainId = useChainId();
    const argsReady = token.address !== zeroAddress && (erc20Amount !== '0' || celoAmount !== '0') && selectedCampaign !== '';

    // Memoize and update the argments
    const {fundsErc20, fundsNative, sortContent, contractAddresses} = React.useMemo(() => {
        let fundsErc20 = 0n;
        let fundsNative = 0n;
        try {
            fundsErc20 = parseUnits(erc20Amount, 18);
            fundsNative = parseUnits(celoAmount, 18);
        } catch (error) {
            alert('Please enter a valid amount');
            // return {fundsErc20: 0n, fundsNative: 0n, sortContent: [], contractAddresses: []};
        }
        const { contractAddresses: ca} = filterTransactionData({chainId, filter: false});
        const contractAddresses = [{name: 'CUSD', address: ca.stablecoin as Address}, {name: 'GROW', address: ca.KnowToken as Address}];
        const sortContent : ContentType[] = [
            {
                tag: 'campaignhash',
                id: 'ERC20Amount',
                label: "Can't find your campaign? Enter it here",
                placeHolder: 'Name of your campaign',
                type: 'text',
                required: false
            },
            {
                tag: 'erc20amount',
                id: 'ERC20Amount',
                label: 'Amount to fund in ERC20-based Token for the current week',
                placeHolder: 'Enter amount',
                type: 'text',
                required: true
            },
            {
                tag: 'celoamount',
                id: 'CeloAmount',
                label: 'Amount to fund in $CELO Token for the current week',
                placeHolder: 'Enter amount',
                type: 'text',
                required: true
            },
        ];
        return {fundsErc20, fundsNative, sortContent, contractAddresses}
    }, [erc20Amount, celoAmount, chainId]);

    // Display transaction drawer
    const handleSort = () => {
        if(!argsReady) return alert('Please fill the required fields');
        toggleDrawer(1);
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => {
        e.preventDefault();
        const value = e.target.value;
        switch (tag) {
            case 'celoamount':
                setCeloAmount(value);
                break;

            case 'erc20amount':
                setErc20Amount(value);
                break;

            case 'campaignhash':
                setCampaign(value);
                break;

            default:
                break;
        }
    } 

    const renderAssets = (
        <Select onValueChange={onValueChange}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue className="font-mono" placeholder={"Select funding asset"} />
            </SelectTrigger>
            <SelectContent className="font-mono">
                <SelectGroup>
                <SelectLabel>Tokens</SelectLabel>
                {
                    contractAddresses?.map(({name}, index) => (
                        <SelectItem
                            key={name.concat(index.toString())} 
                            value={name} 
                            className="capitalize text-cyan-900 cursor-pointer"
                        >
                            { name }
                        </SelectItem>
                    ))
                }
                </SelectGroup>
            </SelectContent>
        </Select>
    );

    return(
        <MotionDisplayWrapper>
            <Wrapper2xl useMinHeight={true} >
                <div className='relative space-y-4 overflow-auto font-mono'>
                    <div className="flex flex-col justify-center items-center text-center gap-4">
                        <h3 className="text-2xl">Setup And Fund a Campaign</h3>
                        <div className="border flex justify-between rounded-2xl p-2">
                            <div className="flex justify-center items-center">
                                <Info className="w-7 h-7 text-cyan-500 font-bold" />
                            </div>
                            <h3 className="text-sm text-center p-2 text-cyan-900">Tokens or Coins funded in campaigns are shared as payout to all active learners. Our team does not have access to it</h3>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center shadow-xl animate-bounce-gentle">
                            <Award className="w-8 h-8 m-auto" />
                        </div>
                        {/* <Image 
                            src={'/support.svg'}
                            alt="support image"
                            width={150}
                            height={150}
                        /> */}
                    </div>

                    <MotionDisplayWrapper>
                        <div className='space-y-4 border rounded-2xl p-4'> 
                            <div className="flex justify-between items-center gap-3">
                                {/* Selected campaign */}
                                <CampaignMap 
                                    campaignData={campaignData}
                                    selectedCampaign={selectedCampaign}
                                    setCampaign={(campaign) => setCampaign(campaign.campaign)}
                                />
                                
                                {/* Select asset */}
                                { renderAssets }
                            </div>


                            <div className="space-y-4">
                                {
                                    sortContent.map(({id, type, required, label, placeHolder, tag}) => (
                                        <Input 
                                            key={tag}
                                            id={id}
                                            onChange={onChange}
                                            required={required}
                                            type={type}
                                            label={label}
                                            placeholder={placeHolder} 
                                            tag={tag}
                                            overrideClassName="f"
                                        />
                                    ))
                                }
                                <CustomButton
                                    onClick={handleSort}
                                    exit={false}
                                    disabled={!argsReady}
                                    overrideClassName="w-full"
                                >
                                    <h3>Submit</h3>
                                </CustomButton>
                            </div>
                        </div>
                    </MotionDisplayWrapper>

                    <div className="space-y-2">
                        
                        {/* <Button disabled={showSendCelo} onClick={() => setShowSendCelo(true)} variant={'outline'} className="w-full bg-cyan-500/80">Send Celo</Button> */}
                        <CustomButton
                            onClick={backToDashboard}
                            disabled={false}
                            exit={true}
                            overrideClassName="w-full"
                        >
                            <span>Exit</span>
                        </CustomButton>
                    </div>
                </div>
            </Wrapper2xl>
            <SetUpCampaign 
                nativeValue={fundsNative} 
                toggleDrawer={toggleDrawer} 
                openDrawer={openDrawer} 
                campaignString={selectedCampaign} 
                fundsErc20={fundsErc20} 
                token={formatAddr(token.address)}
            />
        </MotionDisplayWrapper>
    );
}