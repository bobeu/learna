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
import { zeroAddress } from "viem";

type ContentType = 'address' | 'string';
export function SelectComponent({placeHolder, width, campaigns, title, setHash, contentType} : {placeHolder: string, campaigns: string[]; width?: string; contentType: ContentType; setHash: (arg: string) => void; title?: string;}) {
  const [mounted, setMounted] = React.useState<boolean>(false)
  const onChange = (value: string) => {
    setHash(value);
  }

  React.useEffect(() => {
    if(!mounted){
      let initContent = '';
      switch (contentType) {
        case 'address':
          initContent = campaigns?.[0] || zeroAddress;
          break;

        default:
          initContent = campaigns?.[0];
          break;
      }
      setHash(initContent);
      setMounted(true);
    }
  }, [mounted, contentType, setHash, campaigns]);

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
