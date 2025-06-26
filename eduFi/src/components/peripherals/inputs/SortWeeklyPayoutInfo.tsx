import * as React from 'react';
import { Input, InputTag } from './Input';
import { Address } from '~/components/utilities';
import { parseUnits, zeroAddress } from 'viem';
import { MotionDisplayWrapper } from '../MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import SortWeeklyReward from '~/components/transactions/SortWeeklyEarnings';
import useStorage from '~/components/hooks/useStorage';

interface ContentType { 
    tag: InputTag, 
    placeHolder: string, 
    label: string, 
    type: 'number' | 'text', 
    id: string, 
    required: boolean
};

export default function SortWeeklyPayout() {
    /**
     * @dev Amount in ERC20 token to distribute to users every week end.
     * Parameter is required
    */
    const [ erc20amount, setERC20Amount ] = React.useState<string>('0');

    /**
     * @dev If there is an ERC20 token to distribute, it should be the address of the 
     * token, otherwise, it should be GROW Token address
     * Parameter is optional. Defaults to GROW Token address
    */
    const [ tokenAddress, setTokenAddress ] = React.useState<Address>(zeroAddress);

    /**
     * @dev If there is an ERC20 token to payout other than GROW Token, the address holding 
     * the token should give approval to spend prior to this time. The address that gave approval is the tokenOwner 
     * Parameter is optional
    */
    const [ tokenOwner, setTokenOwner ] = React.useState<Address>(zeroAddress);
    const [ openDrawer, setDrawer ] = React.useState<number>(0);

    const { weekId } = useStorage();
    const toggleDrawer = (arg: number) => setDrawer(arg);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => {
        e.preventDefault();
        const value = e.target.value;
        switch (tag) {
            case 'erc20amount':
                setERC20Amount(value);
                break;
            case 'tokenaddress':
                if(value.length === 42 && value.startsWith('0x')) setTokenAddress(value as Address);
                break;
            case 'owner':
                if(value.length === 42 && value.startsWith('0x')) setTokenOwner(value as Address);
                break;
            default:
                break;
        }
    } 

    // Memoize and update the argments
    const {argsReady, amount, sortContent} = React.useMemo(() => {
        const argsReady = erc20amount !== '';
        const amount = parseUnits(erc20amount, 18);
        const sortContent : ContentType[] = [
            {
                tag: 'erc20amount',
                id: 'ERC20Amount',
                label: 'Amount of ERC20 Token',
                placeHolder: 'Enter amount',
                type: 'text',
                required: true
            },
            {
                tag: 'tokenaddress',
                id: 'TokenAddress',
                label: 'Token contract',
                placeHolder: 'Enter address',
                type: 'text',
                required: false
            },
            {
                tag: 'owner',
                id: 'TokenOwner',
                label: 'Address holding token',
                placeHolder: 'Enter address',
                type: 'text',
                required: false
            }
        ];

        return {argsReady, amount, sortContent}
    }, [erc20amount]);

    // Display transaction drawer
    const handleSort = () => {
        if(!argsReady) return alert('Please provide erc20 token amount');
        toggleDrawer(1);
    }

    return (
        <MotionDisplayWrapper className='space-y-2 mt-2 font-mono border bg-cyan-500/20 rounded-lg p-4'>
            <div className='space-y-2 rounded-xl p-4 bg-cyan-300/5'>
                <h3 className='font-semibold text-sm'>{`Set up week ${weekId} payout. (Only Admin)`}</h3>
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
            </div>
            <Button variant={'outline'} className='w-full bg-cyan-500' onClick={handleSort}>Submit</Button>
            <SortWeeklyReward 
                amountInERC20={amount}
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                owner={tokenOwner}
                token={tokenAddress}
            />
        </MotionDisplayWrapper>
    );
}
