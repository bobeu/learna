"use client"
import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger,} from "~/components/ui/collapsible";

export default function CollapsibleComponent({ header, children} : { header: string, children: React.ReactNode}) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

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
