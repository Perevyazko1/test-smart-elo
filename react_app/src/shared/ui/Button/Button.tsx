import {memo, ButtonHTMLAttributes, ReactNode} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";

export enum ButtonTypes {
    SUBMIT = 'submit',
    RESET = 'reset',
    BUTTON = 'button',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    type: ButtonTypes
    disabled?: boolean
    className?: string
    children?: ReactNode
}

export const Button = memo((props: ButtonProps) => {
    const {
        className,
        disabled,
        children,
        ...otherProps
    } = props

    const mods: Mods = {
        'disabled': disabled,
    };

    return (
        <button
            className={classNames('btn fw-bold', mods, [className])}
            {...otherProps}
        >
            {children}
        </button>
    );
});