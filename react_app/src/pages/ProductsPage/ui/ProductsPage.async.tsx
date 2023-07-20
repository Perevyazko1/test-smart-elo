import {FC, lazy} from 'react';

export const ProductsPageAsync = lazy<FC>(() => import('./ProductsPage'));
