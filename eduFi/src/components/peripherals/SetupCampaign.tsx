import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";
import Image from "next/image";
import { useChainId, } from "wagmi";
import { filterTransactionData, formatAddr, getCampaignHashes } from "../utilities";
// import { Confirmation, type Transaction } from "./Confirmation";
import { parseUnits, zeroAddress } from "viem";
import { Address, CampaignDataFormatted } from "../../../types/quiz";
import Wrapper2xl from "./Wrapper2xl";
import CollapsibleComponent from "./Collapsible";
import CustomButton from "./CustomButton";
import { Info } from "lucide-react";
import SetUpCampaign from "../transactions/SetupCampaigns";
import { Input, InputTag } from "./inputs/Input";
import { ContentType } from "./inputs/SortWeeklyPayoutInfo";

// interface Campaign {campaignHash: `0x${string}`; campaign: string;};

export function CampaignMap(
    {selectedCampaign,campaignData, setCampaign} : 
    {
        selectedCampaign: string; 
        campaignData: CampaignDataFormatted[];
        setCampaign: (data: CampaignDataFormatted) => void;
    }) 
{
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg)
    }
    return (
        <CollapsibleComponent
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            header="Select campaign"
            selected={selectedCampaign}
            overrideClassName="relative"
            triggerClassName="border rounded-xl p-4 bg-gradient-to-r from-cyan-400 to-purple-300 text-white"
        >
            <div className="w-full absolute top-16 text-cyan-900 slide-in-from-top-10 p-4 bg-white z-50 border rounded-xl max-h-[250px] overflow-hidden md:overflow-auto">
                {
                    campaignData?.map((data) => (
                        <Button 
                            key={data.campaignHash}
                            onClick={() => {
                                setCampaign(data);
                                setIsOpen(false)
                            }}
                            variant={'ghost'}
                            className="w-2/4 p-6"
                        >
                            { data.campaign }
                        </Button>
                    ))
                }
            </div>
        </CollapsibleComponent>
    );
}

export default function SetupCampaign() {
    // const [ showSendCelo, setShowSendCelo ] = React.useState<boolean>(false);
    const [ openDrawer, setDrawer ] = React.useState<number>(0);
    const [ celoAmount, setCeloAmount ] = React.useState<string>('0');
    const [ token, setToken ] = React.useState<{address: Address, name: string}>({address: zeroAddress, name: ''});
    const [ erc20Amount, setErc20Amount ] = React.useState<string>('0');
    const [ selectedCampaign, setCampaign ] = React.useState<string>('');
    // const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isAddressesOpen, setIsAddressesOpen] = React.useState<boolean>(false);

    const { setpath, campaignData } = useStorage();
    const toggleDrawer = (arg: number) => {
        setDrawer(arg);
    }
    // const toggleOpen = (arg: boolean) => {
    //     setIsOpen(arg)
    // };

    const toggleOpenAddresses = (arg: boolean) => {
        setIsAddressesOpen(arg)
    };

    const backToDashboard = () => setpath('dashboard');
    const chainId = useChainId();

    // Memoize and update the argments
    const {argsReady, fundsErc20, fundsNative, sortContent, contractAddresses} = React.useMemo(() => {
        const argsReady = token.address !== zeroAddress && (erc20Amount !== '0' || celoAmount !== '0') && selectedCampaign !== '';
        const fundsErc20 = parseUnits(erc20Amount, 18);
        const fundsNative = parseUnits(celoAmount, 18);
        const { contractAddresses: ca} = filterTransactionData({chainId, filter: false});
        const contractAddresses = [{name: 'CELO', address: ca.stablecoin as Address}, {name: 'GROW', address: ca.GrowToken as Address}];
        const sortContent : ContentType[] = [
            {
                tag: 'campaignhash',
                id: 'ERC20Amount',
                label: "Can't find your campaign? Enter it below. We will handle the rest",
                placeHolder: 'Enter the name of your campaign',
                type: 'text',
                required: true
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
        return {argsReady, fundsErc20, fundsNative, sortContent, contractAddresses}
    }, [erc20Amount, celoAmount]);

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
                // const hashes = getCampaignHashes([value]);
                setCampaign(value);
                break;

            default:
                break;
        }
    } 

    // React.useEffect(
    //     () => {
    //         if(campaignHash !== undefined){
    //             setTimeout(() => 
    //                 setShowSendCelo(true), 
    //                 500
    //             );
    //         }
    //         return () => clearTimeout(500);
    //     },
    //     [protocol]
    // );

    const renderAssets = (
        <CollapsibleComponent
            isOpen={isAddressesOpen}
            toggleOpen={toggleOpenAddresses}
            header="Select funding asset"
            selected={token.name}
            overrideClassName="relative"
            triggerClassName="border rounded-xl p-4 bg-gradient-to-r border"
        >
            <div className="w-full absolute top-14 slide-in-from-top-10 p-4 bg-white z-50 border rounded-xl max-h-[250px] overflow-hidden md:overflow-auto">
                {
                    contractAddresses?.map(({address, name}) => (
                        <Button 
                            key={name}
                            onClick={() => {
                                setToken({address, name});
                                setIsAddressesOpen(false);
                            }}
                            variant={'ghost'}
                            className="w-full p-6"
                        >
                            { name }
                        </Button>
                    ))
                }
            </div>
        </CollapsibleComponent>
    );
    // const getTransactions = React.useCallback(() => {
    //     const functionName: FunctionName = 'tip';
    //     const transactions : Transaction[] = [];
    //     const { contractAddresses : ca, transactionData} = filterTransactionData({chainId, filter: true, functionNames:[functionName],})
    //     const contractAddress = ca.Learna as Address;
    //     if(showSendCelo) {
    //         transactions.push({
    //             abi: transactionData[0].abi,
    //             args: [protocol],
    //             contractAddress,
    //             functionName,
    //             requireArgUpdate: false,
    //             value: toBigInt(celoAmount)
    //         })
    //     }
    //     return transactions;
    // }, [showSendCelo, chainId, protocol, celoAmount]);

    // const campaigns = (
    //     <CollapsibleComponent
    //         isOpen={isOpen}
    //         toggleOpen={toggleOpen}
    //         header="Select campaign"
    //         selected={selectedCampaign}
    //         overrideClassName="relati"
    //         triggerClassName="border rounded-xl p-4 bg-gradient-to-r from-cyan-400 to-purple-300"
    //     >
    //         <div className="absolute top-10 slide-in-from-top-10 p-4 bg-white z-[100px] border rounded-xl max-h-[250px] overflow-hidden md:overflow-auto">
    //             {
    //                 campaignData?.map(({campaign, campaignHash}) => (
    //                     <Button 
    //                         key={campaignHash}
    //                         onClick={() => setCampaign(campaign)}
    //                         variant={'ghost'}
    //                         className="w-1/3 p-6"
    //                     >
    //                         { selectedCampaign }
    //                     </Button>
    //                 ))
    //             }
    //         </div>
    //     </CollapsibleComponent>
    // );

    return(
        <MotionDisplayWrapper>
            <Wrapper2xl useMinHeight={true} >
                <div className='relative space-y-4 overflow-auto font-mono'>
                    <div className="flex flex-col justify-center items-center text-center text-x gap-4">
                        <h3>Want to build interest in your protocol or tech? Open, add and fund a campaign and watch the magic. Our system is decentralized and transparent. </h3>
                        <Image 
                            src={'/support.svg'}
                            alt="support image"
                            width={150}
                            height={150}
                        />
                    </div>

                    <MotionDisplayWrapper>
                        <div className='space-y-4 border rounded-2xl p-4'> 

                            {/* Selected campaign */}
                            <CampaignMap 
                                campaignData={campaignData}
                                selectedCampaign={selectedCampaign}
                                setCampaign={(campaign) => setCampaign(campaign.campaign)}
                            />
                            
                            {/* Select asset */}
                            { renderAssets }

                            {/* <div className="flex justify-between items-center gap-4 text-lg bg-gradient-to-r px-3 py-6 rounded-xl">
                                <h3 className='w-2/4'>{`Campaign`}</h3>
                                <h3 className='w-2/4 capitalize font-medium'>{selectedCampaign}</h3>
                            </div> */}
                            <div className="space-y-3">
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
                                        />
                                    ))
                                }
                                
                                <Button variant={'ghost'} className='w-full bg-white text-lg p-6' onClick={handleSort}>Submit</Button>
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
                    <div className="border flex justify-between rounded-2xl">
                        <div className="flex justify-center items-center p-4">
                            <Info className="w-7 h-7 text-cyan-500 font-bold" />
                        </div>
                        <h3 className="text-sm text-center p-4 text-cyan-900">Tokens or Coins funded in campaigns are shared as payout to all active learners. Our team does not have access to it</h3>
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