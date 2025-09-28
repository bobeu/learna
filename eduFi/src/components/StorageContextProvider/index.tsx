"use client"

import React from "react";
import type { DataContextProps, NeynaDataContextProps } from './storageContext';

export interface LearnaProviderProps {
    value: DataContextProps;
    children: React.ReactNode;
}

// Neyna authentication type
export interface NeynaProviderProps {
    value: NeynaDataContextProps;
    children: React.ReactNode;
}
export const NeynarDataContext = React.createContext<NeynaDataContextProps | null>(null); 

export const DataContext = React.createContext<DataContextProps | null>(null);

export const StorageContextProvider = ({ value, children } : LearnaProviderProps) => {
    return(
        <DataContext.Provider value={value}>
            { children }
        </DataContext.Provider>
    );
}

export const NeynaStorageContextProvider = ({ value, children } : NeynaProviderProps) => {
    return(
        <NeynarDataContext.Provider value={value}>
            { children }
        </NeynarDataContext.Provider>
    );
}
