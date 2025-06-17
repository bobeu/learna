import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription
} from "~/components/ui/sheet";

export default function Drawer({openDrawer, toggleDrawer, title, children} : {openDrawer: boolean, title?: string, toggleDrawer: (arg:boolean) => void, children: React.ReactNode}) {
  return (
    <Sheet 
      open={openDrawer} 
      onOpenChange={toggleDrawer} 
      aria-describedby={undefined}
    >
      <SheetContent side={'bottom'} className="space-y-3">
        <SheetHeader className="font-mono mb-4">
          { title && <SheetTitle>{title}</SheetTitle> }
        </SheetHeader>
        <SheetDescription>{''}</SheetDescription>
        <div className="grid flex-1 font-mono auto-rows-min gap-4">
            { children }
        </div>
        <SheetFooter>
          <SheetClose>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
