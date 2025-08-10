import * as React from 'react';
import { Input, InputTag } from './Input';
import { parseUnits } from 'viem';
import SortWeeklyReward from '~/components/transactions/SortWeeklyEarnings';
import useStorage from '~/components/hooks/useStorage';
import CustomButton from '../CustomButton';
import { toBN } from '~/components/utilities';

export default function SortWeeklyPayout() {
    const [ growTokenAmount, setGrowTokenAmount ] = React.useState<string>('0');
    const [ openDrawer, setDrawer ] = React.useState<number>(0);
    const [ newInterval, setNewInterval ] = React.useState<number>(0);

    const { weekId } = useStorage();
    const toggleDrawer = (arg: number) => setDrawer(arg);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => {
        e.preventDefault();
        const value = e.target.value;
        switch (tag) {
            case 'growtokenamount':
                setGrowTokenAmount(value);
                break;
            default:
                setNewInterval(toBN(value).toNumber());
                break;
        }
    } 

    // Memoize and update the argments
    const {argsReady, amount, sortContent} = React.useMemo(() => {
        const argsReady = growTokenAmount !== '';
        const amount = parseUnits(growTokenAmount, 18);
        const sortContent : ContentType[] = [
            {
                tag: 'growtokenamount',
                id: 'GrowTokenAmount',
                label: 'Amount of $GROW Token to share this week',
                placeHolder: 'Enter amount',
                type: 'text',
                required: true
            },
            {
                tag: 'erc20amount',
                id: 'GrowTokenAmount',
                label: 'New transition interval (In hrs)',
                placeHolder: 'Deadline',
                type: 'number',
                required: false
            }
        ];
        return {argsReady, amount, sortContent}
    }, [growTokenAmount]);

    // Display transaction drawer
    const handleSort = () => {
        if(!argsReady) return alert('Please provide amount to fund in $GROW token');
        toggleDrawer(1);
    }

    return (
        <div className='space-y-2 my-2 mb-4 font-mono border bg-gradient-to-r rounded-2xl p-4 w-full '>
            <div className='space-y-4 rounded-xl p-4'>
                <h3 className='font-semibold text-xl'>{`Set up week ${weekId} payout. (Only Admin)`}</h3>
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
            <div className='w-full'>
                <CustomButton
                    onClick={handleSort}
                    exit={false}
                    disabled={false}
                    overrideClassName='w-full'
                >
                    <span>Submit</span>
                </CustomButton>
            </div>
            {/* <Button variant={'outline'} className='w-full bg-cyan-500' onClick={handleSort}>Submit</Button> */}
            <SortWeeklyReward 
                growTokenAmount={amount}
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                newInterval={newInterval}
            />
        </div>
    );
}

export interface ContentType { 
    tag: InputTag, 
    placeHolder: string, 
    label: string, 
    type: 'number' | 'text', 
    id: string, 
    required: boolean
};

            // {
            //     tag: 'celoamount',
            //     id: 'GrowTokenAmount',
            //     label: 'New claim deadline (In Min)',
            //     placeHolder: 'Deadline',
            //     type: 'number',
            //     required: false
            // },