import React from "react"

export default function CustomButton({onClick, disabled, exit, children, overrideClassName}: {onClick: React.MouseEventHandler<HTMLButtonElement> | undefined, disabled: boolean, children: React.ReactNode, exit: boolean, overrideClassName?: string}) {
    return(
        <button
            className={`${exit? "flex-1 bg-gradient-to-r border py-4 px-6 flex items-center justify-center gap-4 rounded-xl" : "flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"} ${overrideClassName}`}
            onClick={onClick}
            disabled={disabled}
        >
            { children }
        </button>
    )
}