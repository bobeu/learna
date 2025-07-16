import * as React from 'react';
import { Input, InputTag } from './Input';
import CustomButton from '../CustomButton';
import SetTransitionInterval from '~/components/transactions/SetTransitionInterval';

export default function TransitionInterval() {
    const [ interval, seInterval] = React.useState<string>('0');
    const [ openDrawer, setDrawer ] = React.useState<number>(0);

    const toggleDrawer = (arg: number) => setDrawer(arg);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => {
        e.preventDefault();
        const value = e.target.value;
        switch (tag) {
            case 'celoamount':
                seInterval(value);
                break;
            default:
                break;
        }
    } 

    // Memoize and update the argments
    const { amount, sortContent} = React.useMemo(() => {
        const amount = Number(interval);
        const sortContent : ContentType[] = [
            {
                tag: 'celoamount',
                id: 'Interval',
                label: 'Transition interval',
                placeHolder: 'Enter interval',
                type: 'text',
                required: true
            }
        ];
        return {amount, sortContent}
    }, [interval]);

    // Display transaction drawer
    const handleSort = () => {
        toggleDrawer(1);
    }

    return (
        <div className='space-y-2 my-2 mb-4 font-mono border bg-gradient-to-r rounded-2xl p-4 w-full '>
            <div className='space-y-4 rounded-xl p-4'>
                <h3 className='font-semibold text-xl'>{`Set a new transition interval. (Only Admin)`}</h3>
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
            <SetTransitionInterval
                interval={amount}
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
