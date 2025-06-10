import React from 'react';
import { DataContext } from '.';

export default function useStorage(){
    const context = React.useContext(DataContext);
    if(!context) {
        throw new Error("Data must be used within SimplifiProvider");
    }
    
    return { ...context }

}