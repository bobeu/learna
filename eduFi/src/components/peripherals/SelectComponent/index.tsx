import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export function SelectComponent({placeHolder, campaigns, setHash} : {placeHolder: string, campaigns: string[], setHash: (arg: string) => void}) {
    const onChange = (value: string) => {
        setHash(value);
    }

    React.useEffect(() => {
      setHash(campaigns?.[0]);
    }, []);

    return (
    <Select onValueChange={onChange} defaultValue={campaigns?.[0]}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeHolder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Campaigns</SelectLabel>
          {
            campaigns?.map((campaign) => (
                <SelectItem key={campaign} value={campaign} >{campaign}</SelectItem>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
