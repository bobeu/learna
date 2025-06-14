import { Button } from "~/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"

export default function Drawer({openDrawer, toggleDrawer, title, children} : {openDrawer: boolean, title?: string, toggleDrawer: () => void, children: React.ReactNode}) {
  return (
    <Sheet 
      open={openDrawer} 
      onOpenChange={toggleDrawer} 
    >
      <SheetContent side={'bottom'}>
        <SheetHeader className="font-mono mb-4">
          { title && <SheetTitle>{title}</SheetTitle> }
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 mb-2">
            { children }
        </div>
        <SheetFooter>
          <Button 
            onClick={toggleDrawer}
            className="bg-orange-500/30 font-mono" 
            variant="outline"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
