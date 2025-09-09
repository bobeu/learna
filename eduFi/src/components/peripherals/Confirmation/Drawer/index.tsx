import * as React from 'react';
import { Drawer as MuiDrawer, } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import DrawerHeader from './DrawerHeader';
import { ToggleDrawer, VoidFunc } from '../../../../../types';

const toggleDrawer : ToggleDrawer =
    (value: number, setState: (value: number) => void) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
        return;
    }

    setState(value );
};

export default function Drawer({ openDrawer, styles, disableAction, setDrawerState, title, onClickAction, children } : DrawerProps) {
    const isLargeScreen = useMediaQuery('(min-width:768px)');
    const entry = openDrawer === 0? false : true;
    return (
        <MuiDrawer
            anchor={isLargeScreen? 'right' : 'bottom'}
            open={entry}
            onClose={() => toggleDrawer(0, setDrawerState)}
        >
            <div
                style={{ width: 'auto', ...styles}}
                role="presentation"
                onClick={() => toggleDrawer(0, setDrawerState)}
                onKeyDown={() => toggleDrawer(0, setDrawerState)}
                className='border bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 overflow-auto p-4 space-y-4'
            >
                <DrawerHeader 
                    title={title} 
                    disableAction={disableAction}
                    onClickAction={onClickAction} 
                />
                <div className="w-full glass-card rounded-2xl p-4 text-center mb-6">
                    { children }
                </div>
            </div>
        </MuiDrawer>    
    );
}

export interface DrawerProps { 
    openDrawer: number;
    disableAction: boolean;
    styles?: React.CSSProperties;
    setDrawerState: (arg: number) => void;
    children: React.ReactNode;
    onClickAction: VoidFunc;
    title: string;
}