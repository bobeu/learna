import { Button } from "~/components/ui/button";
import { VoidFunc } from "~/components/utilities";

export default function DrawerHeader({title, onClickAction} : {title: string, onClickAction: VoidFunc}) {

    return(
        <header className={`flex justify-between items-center font-mono p-4 border rounded-lg font-semibold`}>
            <h3 className="w-[80%] max-w-sm">{title}</h3>
            <Button variant={'ghost'} className="w-[20%] dark:text-orangec" onClick={onClickAction}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </Button>
        </header>
    );
}