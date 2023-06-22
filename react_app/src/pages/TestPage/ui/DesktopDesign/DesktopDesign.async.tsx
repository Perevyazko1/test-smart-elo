import {FC, lazy} from 'react';

export const DesktopDesignAsync = lazy<FC>(() => import('./DesktopDesign'));
