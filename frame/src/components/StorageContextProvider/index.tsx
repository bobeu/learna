"use client"

import React from "react";
import {type DataContextProps} from './simpliDataContext';

export interface RandoAppProviderProps {
    value: DataContextProps;
    children: React.ReactNode;
}

export const DataContext = React.createContext<DataContextProps | null>(null);

export const StorageContextProvider = ({ value, children } : RandoAppProviderProps) => {
    return(
        <DataContext.Provider value={value}>
            { children }
        </DataContext.Provider>
    );
}
