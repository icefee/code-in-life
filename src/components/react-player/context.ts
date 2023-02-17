import { createContext } from 'react';
import { PlayerContextType } from './type';

const context = createContext<PlayerContextType>(null)

export default context;
