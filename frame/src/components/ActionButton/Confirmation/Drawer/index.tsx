// import * as React from 'react';
// // import Box from '@mui/material/Box';
// import { Drawer as MuiDrawer, } from '@mui/material';
// import { useMediaQuery } from '@mui/material';
// import type { ToggleDrawer, VoidFunc } from '@/interfaces';
// // import { useTheme } from 'next-themes';
// import DrawerHeader from '@/components/utilities/DrawerHeader';

// const toggleDrawer : ToggleDrawer =
//     (value: number, setState: (value: number) => void) =>
//     (event: React.KeyboardEvent | React.MouseEvent) => {
//     if (
//         event.type === 'keydown' &&
//         ((event as React.KeyboardEvent).key === 'Tab' ||
//         (event as React.KeyboardEvent).key === 'Shift')
//     ) {
//         return;
//     }

//     setState(value );
// };

// export default function Drawer({ openDrawer, styles, setDrawerState, title, onClickAction, children } : DrawerProps) {
//     const isLargeScreen = useMediaQuery('(min-width:768px)');
//     // const isDark = useTheme().theme === 'dark';
//     const entry = openDrawer === 0? false : true;
//     return (
//         <MuiDrawer
//             anchor={isLargeScreen? 'right' : 'bottom'}
//             open={entry}
//             onClose={() => toggleDrawer(0, setDrawerState)}
//         >
//             <div
//                 style={{ width: isLargeScreen? 400 : 'auto', ...styles}}
//                 role="presentation"
//                 onClick={() => toggleDrawer(0, setDrawerState)}
//                 onKeyDown={() => toggleDrawer(0, setDrawerState)}
//                 className='h-screen overflow-auto p-4 space-y-2 bg-white1 dark:bg-green1 border-l'
//             >
//                 <DrawerHeader title={title} onClickAction={onClickAction} />
//                 { children }
//             </div>
//         </MuiDrawer>    
//     );
// }

// export interface DrawerProps { 
//     openDrawer: number;
//     styles?: React.CSSProperties;
//     setDrawerState: (arg: number) => void, children: React.ReactNode;
//     onClickAction: VoidFunc;
//     title: string;
// }







import { Button } from "~/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"

export default function Drawer({title, description, children} : {title?: string, description?: string, children: React.ReactNode}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent side={'bottom'}>
        <SheetHeader>
            { title && <SheetTitle>Edit profile</SheetTitle> }
            { description && <SheetDescription>{description}</SheetDescription> }
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
            { children }
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
