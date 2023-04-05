import {memo, ReactNode, InputHTMLAttributes} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string
    children?: ReactNode
}


export const Input = memo((props: InputProps) => {
    const {
        className,
        children,
        ...otherProps
    } = props

    const mods: Mods = {};

    return (
        <input
            className={classNames("form-control form-control-lg", mods, [className])}
            {...otherProps}
        >
            {children}
        </input>
    );
});