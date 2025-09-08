import { useMiniApp } from "@neynar/react";
import React from "react";

export const LayoutContext = ({overrideClassName, children} : {overrideClassName?: string | undefined, children: React.ReactNode}) => {
    const { context, isSDKLoaded } = useMiniApp();
    return(
        <div 
            style={{
                paddingTop: context?.client.safeAreaInsets?.top ?? 10,
                paddingBottom: context?.client.safeAreaInsets?.bottom ?? 10,
                paddingLeft: context?.client.safeAreaInsets?.left ?? 10,
                paddingRight: context?.client.safeAreaInsets?.right ?? 10,
            }}
            className={["relative pb-4 mx-auto bg-white dark:bg-blackish"].join(overrideClassName)}
    >
        { isSDKLoaded && children }
    </div>
    );
}