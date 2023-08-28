import {InputHTMLAttributes, ReactNode} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string;
    children?: ReactNode;
    inputSize?: 'lg' | 'sm';
    theme?: 'dark' | 'light';
}


export const AppInput = (props: InputProps) => {
    const {
        className,
        children,
        inputSize = 'lg',
        theme = 'light',
        ...otherProps
    } = props

    const mods: Mods = {
        'form-control-lg': inputSize === 'lg',
        'form-control-sm': inputSize === 'sm',
    };

    return (
        <input
            data-bs-theme={theme}
            className={classNames("form-control fw-bold", mods, [className])}
            {...otherProps}
        >
            {children}
        </input>
    );
};