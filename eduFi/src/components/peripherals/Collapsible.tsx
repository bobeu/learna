"use client"
import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
// import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible";

export default function CollapsibleComponent({ header, isOpen, triggerClassName, overrideClassName, toggleOpen, selected, children} : CollapsibleProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={toggleOpen}
      className={`flex flex-col gap-2 ${overrideClassName}`}
    >
      <CollapsibleTrigger asChild>
        <button className={`flex justify-between items-center ${triggerClassName}`}>
          <h4>{isOpen? 'Close' : selected || header}</h4>
          <ChevronsUpDown className="w-5 h-5"/>
          <span className="sr-only">Toggle</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        { children }
      </CollapsibleContent>
    </Collapsible>
  )
}
 
export interface CollapsibleProps { 
  isOpen: boolean;
  toggleOpen: (arg: boolean) => void;
  header: string;
  selected?: string | number | null;
  children: React.ReactNode;
  overrideClassName?: string;
  triggerClassName?: string;
}