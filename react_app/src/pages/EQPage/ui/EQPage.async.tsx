import {FC, lazy} from 'react';

export const EQPageAsync = lazy<FC>(() => import('./EQPage'));
