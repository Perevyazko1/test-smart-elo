import {FC, lazy} from 'react';

export const MobileDesignAsync = lazy<FC>(() => import('./MobileDesign'));
