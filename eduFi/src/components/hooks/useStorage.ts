import React from 'react';
import { DataContext } from '../StorageContextProvider';

export default function useStorage(){
    const context = React.useContext(DataContext);
    if(!context) {
        throw new Error("Data must be used within EducasterProvider");
    }
    
    return { ...context }

}