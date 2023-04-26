import {FC, lazy} from 'react';

export const TaxControlPageAsync = lazy<FC>(() => import('./TaxControlPage'));
