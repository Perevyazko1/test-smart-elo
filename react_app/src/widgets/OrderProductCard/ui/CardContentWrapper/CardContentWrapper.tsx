import {memo, ReactNode} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface CardContentWrapperProps {
    width?: string
    flexFill?: boolean
    className?: string
    children?: ReactNode
}


export const CardContentWrapper = memo((props: CardContentWrapperProps) => {
    const {
        width = "50px",
        className,
        children,
        flexFill = false,
        ...otherProps
    } = props

    const mods: Mods = {
        'flex-fill': flexFill
    };

    return (
        <div
            className={
                classNames('bg-gradient bg-light border rounded p-1 m-0', mods, [className])}
            {...otherProps}
            style={{
                height: "100px",
                width: width
            }}
        >
            {children}
        </div>
    );
});