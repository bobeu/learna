import React from "react";
import { useFrame } from "./providers/FrameProvider";

export const ContextWrapper = ({className, children} : {className: string | undefined, children: React.ReactNode}) => {
    const { context } = useFrame();
    return(
        <div 
            style={{
                paddingTop: context?.client.safeAreaInsets?.top ?? 10,
                paddingBottom: context?.client.safeAreaInsets?.bottom ?? 10,
                paddingLeft: context?.client.safeAreaInsets?.left ?? 10,
                paddingRight: context?.client.safeAreaInsets?.right ?? 10,
            }}
            className={["relative md:w-[424px] md:h-[695px] mx-auto"].join(className)}
    >
        { children }
    </div>
    );
}