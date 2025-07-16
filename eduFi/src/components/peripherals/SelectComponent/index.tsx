import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export function SelectComponent({placeHolder, width, campaigns, title, setHash} : {placeHolder: string, campaigns: string[]; width?: string; setHash: (arg: string) => void; title?: string;}) {
    const onChange = (value: string) => {
      setHash(value);
    }

    React.useEffect(() => {
      setHash(campaigns?.[0]);
    }, [campaigns, setHash]);

    return (
    <Select onValueChange={onChange} defaultValue={campaigns?.[0]}>
      <SelectTrigger className={`${width || 'w-[200px]'} max-w-sm md:max-w-md`}>
        { title && <h3 className="text-sm capitalize text-pink-600">{title}</h3>}
        <SelectValue placeholder={placeHolder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectLabel>Campaigns</SelectLabel> */}
          {
            campaigns? campaigns?.map((campaign, index) => (
                <SelectItem 
                  key={campaign?.concat(index.toString())} 
                  value={campaign} 
                  className="capitalize"
                >
                  {campaign}
                </SelectItem>
            )) : <SelectItem value={"No campaign"}>No campaign</SelectItem>
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
