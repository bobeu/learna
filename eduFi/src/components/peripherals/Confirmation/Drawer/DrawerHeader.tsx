import { Button } from "@/components/ui/button";
import { VoidFunc } from "../../../../../types";
import { X } from "lucide-react";

export default function DrawerHeader({title, onClickAction} : {title: string, onClickAction: VoidFunc}) {

    return(
        <header className={`bg-gradient-r text-lg flex justify-between items-center border p-4 rounded-2xl font-mono`}>
            <h3 className="w-[80%] text-lg max-w-sm ">{title}</h3>
            <Button 
                variant={'ghost'} 
                className="w-[20%]" 
                onClick={onClickAction}
            >
                <X className="w-12 h-12"/>
            </Button>
        </header>
    );
}