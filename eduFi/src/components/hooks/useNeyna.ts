import React from 'react';
import { NeynarDataContext } from '../StorageContextProvider';

export default function useContext(){
    const context = React.useContext(NeynarDataContext);
    if(!context) {
        throw new Error("Data must be used within NeynaProvider");
    }
    
    return { ...context }

}