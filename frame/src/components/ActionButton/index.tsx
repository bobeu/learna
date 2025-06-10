import React from "react";
import { Button } from "@/components/ui/button";

export const ActionButton = ({ disabled, buttonContent, widthType, variant, toggleDrawer, optionalButtonContent}: ActionButtonProps) => {
    return(
        <Button
            variant={variant || 'outline'}
            disabled={disabled}
            onClick={() => toggleDrawer(1)}
            className={`flex justify-center items-center bg-white dark:bg-green1/90 text-green1/80 dark:text-orange-200 capitalize ${widthType} max-w-sm dark:shadow-sm dark:shadow-orange-50/50`}
        >
            { optionalButtonContent && optionalButtonContent }
            { buttonContent }
        </Button>
    );
}

type ActionButtonProps = {
    disabled: boolean;
    buttonContent: string;
    toggleDrawer: (arg: number) => void;
    optionalButtonContent?: React.ReactNode;
    widthType: string;
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null
}