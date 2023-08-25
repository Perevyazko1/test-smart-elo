import {memo, ReactNode, InputHTMLAttributes} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import cls from './Checkbox.module.scss'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement>{
    id: string
    className?: string
    children?: ReactNode
}


export const Checkbox = memo((props: CheckboxProps) => {
    const {
        className,
        children,
        id,
        ...otherProps
    } = props

    const mods: Mods = {
        [cls.largeSize]: true
    };

    return (
        <div className={className}>
            <input
                className={classNames('form-check-input', mods, [])}
                type="checkbox"
                id={id}
                {...otherProps}
            />
            <label
                className="form-check-label mx-xl-3 my-xl-0"
                htmlFor={id}
            >
                {children}
            </label>
        </div>

    );
});