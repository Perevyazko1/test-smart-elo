import {FC, lazy} from 'react';

export const AssignmentPageAsync = lazy<FC>(() => import('./AssignmentPage'));