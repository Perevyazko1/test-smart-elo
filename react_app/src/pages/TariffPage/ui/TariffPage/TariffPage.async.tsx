import {FC, lazy} from 'react';

export const TariffPageAsync = lazy<FC>(() => import('./TariffPage'));
