import {memo, ReactNode} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface EqInWorkBlockProps {
    className?: string
    children?: ReactNode
}


export const EqInWorkBlock = memo((props: EqInWorkBlockProps) => {
    const {
        className,
        children,
        ...otherProps
    } = props

    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            {children}
        </div>
    );
});