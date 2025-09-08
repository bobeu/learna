import * as React from 'react';
import { Input, InputTag } from './Input';
import CustomButton from '../CustomButton';
import { formatAddr } from '@/components/utilities';
import SetAdmin from '@/components/transactions/SetAdmin';

export default function Admins() {
    const [ admin, setAdmin ] = React.useState<string>('');
    const [ openDrawer, setDrawer ] = React.useState<number>(0);

    const toggleDrawer = (arg: number) => setDrawer(arg);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => {
        e.preventDefault();
        const value = e.target.value;
        switch (tag) {
            case 'token':
                if(value.startsWith('0x') && value.length === 42){
                    setAdmin(value);
                }
                break;
            default:
                break;
        }
    } 

    // Memoize and update the argments
    const {argsReady, arg, sortContent} = React.useMemo(() => {
        const argsReady = admin !== '' && admin.length === 42 && admin.startsWith('0x');
        const arg = formatAddr(admin);
        const sortContent : ContentType[] = [
            {
                tag: 'token',
                id: 'AdminAddress',
                label: 'Enter admin address',
                placeHolder: 'Only valid address',
                type: 'text',
                required: true
            }
        ];
        return {argsReady, arg, sortContent}
    }, [admin]);

    // Display transaction drawer
    const handleSort = () => {
        if(!argsReady) return alert('Please provide a valid admin address');
        toggleDrawer(1);
    }

    return (
        <div className='space-y-2 my-2 mb-4 font-mono border bg-gradient-to-r rounded-2xl p-4 w-full '>
            <div className='space-y-4 rounded-xl p-4'>
                <h3 className='font-semibold text-xl'>{`Add an admin address. (Only Owner)`}</h3>
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

            <SetAdmin 
                admin={arg}
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
// case 'tokenaddress':
//                 if(value.length === 42 && value.startsWith('0x')) setTokenAddress(value as Address);
//                 break;
//             case 'owner':
//                 if(value.length === 42 && value.startsWith('0x')) setTokenOwner(value as Address);
//                 break;