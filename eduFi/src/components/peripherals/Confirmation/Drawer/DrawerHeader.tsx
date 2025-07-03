import { Button } from "~/components/ui/button";
import { VoidFunc } from "../../../../../types/quiz";
import { X } from "lucide-react";

export default function DrawerHeader({title, onClickAction} : {title: string, onClickAction: VoidFunc}) {

    return(
        <header className={`bg-brand-gradient text-white text-lg flex justify-between items-center p-4 rounded-2xl font-semibold`}>
            <h3 className="w-[60%] text-s max-w-sm ">{title}</h3>
            <Button variant={'ghost'} className="w-[20%]" onClick={onClickAction}>
                <X className="w-12 h-12"/>
            </Button>
        </header>
    );
}