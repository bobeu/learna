import React from "react";
import { Input as InputComponent } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
// import { Button } from "~/components/ui/button";

export type InputTag = 'growtokenamount' | 'celoamount' | 'erc20amount' | 'token' | 'campaignhash';
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
        <div className="">
            <div className="w-full flex justify-between items-center border p-3 rounded-xl bg-gradient-to-r ">
                { label && <Label className="text-left w-2/4">{label}</Label>}
                <div className={"w-2/4"}>
                    <InputComponent 
                        type={type}
                        placeholder={placeholder}
                        required
                        id={id}
                        onChange={(e) => onChange(e, tag)}
                        className={`w-full bg-white border ${overrideClassName}`}
                    />
                </div>
            </div>
        </div>
    )
}