import {lazy, FC} from 'react';
import {PinCodeAuthFormProps} from './PinCodeAuthForm'

export const PinCodeAuthFormAsync = lazy<FC<PinCodeAuthFormProps>>(
    () => import('./PinCodeAuthForm'),
);
