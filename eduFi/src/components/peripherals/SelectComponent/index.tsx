/**eslint-disable */

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import AddressWrapper from "../AddressFormatter/AddressWrapper";

export function SelectComponent({placeHolder, width, campaigns, title, setHash} : {placeHolder: string, campaigns: string[]; width?: string; setHash: (arg: string) => void; title?: string;}) {
  const [mounted, setMounted] = React.useState<boolean>(false)
  const onChange = (value: string) => {
    setHash(value);
  }

  React.useEffect(() => {
    if(!mounted){
      setHash(campaigns?.[0] || 'mockHash');
      setMounted(true);
    }
  }, [mounted, setHash, campaigns]);

  return (
  <Select onValueChange={onChange} defaultValue={campaigns?.[0]}>
    <SelectTrigger className={`${width || 'w-[200px]'} max-w-sm md:max-w-md`}>
      { title && <h3 className="text-sm capitalize text-gray-600">{title}</h3>}
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
                { campaign?.length === 42 ? <AddressWrapper account={campaign} display size={3} /> : campaign }
              </SelectItem>
            )) : <SelectItem value={"No campaign"}>No campaign</SelectItem>
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
