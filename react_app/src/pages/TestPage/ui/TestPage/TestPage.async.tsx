import {FC, lazy} from 'react';

export const TestPageAsync = lazy<FC>(() => import('./TestPage'));
