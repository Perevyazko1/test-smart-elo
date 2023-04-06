import {FC, lazy} from 'react';

export const LoginPageAsync = lazy<FC>(() => import('./LoginPage'));
