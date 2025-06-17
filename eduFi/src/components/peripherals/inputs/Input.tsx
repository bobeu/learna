import React from "react";
import { Input as InputComponent } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
// import { Button } from "~/components/ui/button";

export type InputTag = 'erc20amount' | 'tokenaddress' | 'owner';
export interface InputCategoryProp {
    selected: string | number;
    handleChange: (value: string, tag: InputTag) => void
}

interface InputProps {
    type: 'number' | 'text';
    placeholder?: string;
    id: string;
    tag: InputTag;
    label?: string;
    required: boolean;
    overrideClassName?: string;
    onChange: (arg: React.ChangeEvent<HTMLInputElement>, tag: InputTag) => void;
}

export const Input = (props: InputProps) => {
    const { type, placeholder, label, tag, id, overrideClassName, onChange } = props;
    return(
        <div className="flex w-full max-w-sm items-center ">
            <div className="w-full max-w-sm items-center gap-1.5">
                { label && <Label className="text-xs font-medium">{label}</Label>}
                <div className={"flex justify-between items-center gap-2"}>
                    <InputComponent 
                        type={type}
                        placeholder={placeholder}
                        required
                        id={id}
                        onChange={(e) => onChange(e, tag)}
                        className={`bg-white1 text-xs dark:bg-gray1 border border-green1/30 dark:border-white1/30 dark:text-orange-200 focus:ring-0 ${overrideClassName}`}
                    />
                </div>
            </div>
        </div>
    )
}