import {FC, lazy} from 'react';

export const WagesPageAsync = lazy<FC>(() => import('./WagesPage'));
