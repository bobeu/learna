import * as React from 'react';
import { Input, InputTag } from './Input';
import { parseUnits } from 'viem';
import CustomButton from '../CustomButton';
import SetMinimumToken from '@/components/transactions/SetMinimumToken';

export default function MinimumToken() {
    const [ minimumToken, setMinimumToken] = React.useState<string>('0');
    const [ openDrawer, setDrawer ] = React.useState<number>(0);

    const toggleDrawer = (arg: number) => setDrawer(arg);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => {
        e.preventDefault();
        const value = e.target.value;
        switch (tag) {
            case 'celoamount':
                setMinimumToken(value);
                break;
            default:
                break;
        }
    } 

    // Memoize and update the argments
    const { amount, sortContent} = React.useMemo(() => {
        const amount = parseUnits(minimumToken, 18);
        const sortContent : ContentType[] = [
            {
                tag: 'celoamount',
                id: 'MinimumToken',
                label: 'Minimum token payable by learners',
                placeHolder: 'Enter amount',
                type: 'text',
                required: true
            }
        ];
        return {amount, sortContent}
    }, [minimumToken]);

    // Display transaction drawer
    const handleSort = () => {
        toggleDrawer(1);
    }

    return (
        <div className='space-y-2 my-2 mb-4 font-mono border bg-gradient-to-r rounded-2xl p-4 w-full '>
            <div className='space-y-4 rounded-xl p-4'>
                <h3 className='font-semibold text-xl'>{`Adjust minimum token. (Only Admin)`}</h3>
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
            <SetMinimumToken 
                minimumToken={amount}
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
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
