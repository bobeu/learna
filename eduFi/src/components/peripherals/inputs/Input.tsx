import React from "react";
import { Input as InputComponent } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <div>
            <div className="border p-4 rounded-xl space-y-3 bg-gradient-to-r ">
                { label && <Label className="text-lg">{label}</Label>}
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
    )
}