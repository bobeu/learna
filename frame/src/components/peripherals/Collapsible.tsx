"use client"
import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger,} from "~/components/ui/collapsible";
import useStorage from "../StorageContextProvider/useStorage";

export default function CollapsibleComponent({ header, id, children} : {id: number, header: string, children: React.ReactNode}) {
  const { weekId } = useStorage();
  const [isOpen, setIsOpen] = React.useState(BigInt(id) === weekId? true: false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2"
    >
      <CollapsibleTrigger asChild className="max-w-sm">
        <Button variant="outline" className={`flex justify-between items-center ${isOpen? 'bg-cyan-500' : ''}`}>
          <h4>{isOpen? 'Close' : header}</h4>
          <ChevronsUpDown />
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        { children }
      </CollapsibleContent>
    </Collapsible>
  )
}
