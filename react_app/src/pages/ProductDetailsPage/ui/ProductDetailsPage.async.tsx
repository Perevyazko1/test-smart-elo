import {FC, lazy} from 'react';

export const ProductDetailsPageAsync = lazy<FC>(() => import('./ProductDetailsPage'));
