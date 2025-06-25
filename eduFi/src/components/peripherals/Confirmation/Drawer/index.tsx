import * as React from 'react';
import { Drawer as MuiDrawer, } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { ToggleDrawer, VoidFunc } from '~/components/utilities';
import DrawerHeader from './DrawerHeader';

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

export default function Drawer({ openDrawer, styles, setDrawerState, title, onClickAction, children } : DrawerProps) {
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
                className='h-screen overflow-auto p-4 space-y-2 border'
            >
                <DrawerHeader title={title} onClickAction={onClickAction} />
                { children }
            </div>
        </MuiDrawer>    
    );
}

export interface DrawerProps { 
    openDrawer: number;
    styles?: React.CSSProperties;
    setDrawerState: (arg: number) => void;
    children: React.ReactNode;
    onClickAction: VoidFunc;
    title: string;
}