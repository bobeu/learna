import Blockies from "react-blockies";
import { zeroAddress } from "viem";

interface BlockieProp {
  account: string;
  size?: number;
}

export const Blockie = (props: BlockieProp) => {
  const { account, size } = props;

  return (
    <Blockies
      seed={account?.toLowerCase() || zeroAddress}
      size={size || 4}
      scale={3}
    />
  );
}
