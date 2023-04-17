import {memo, ReactNode, MouseEventHandler} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface CardContentWrapperProps {
    width?: string
    warning?: boolean,
    flexFill?: boolean
    className?: string
    children?: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
}


export const CardContentWrapper = memo((props: CardContentWrapperProps) => {
    const {
        width = "50px",
        className,
        children,
        flexFill = false,
        onClick,
        warning = false,
        ...otherProps
    } = props

    const mods: Mods = {
        'flex-fill': flexFill,
        'bg-warning': warning,
        'bg-light': !warning,
    };

    return (
        <div
            className={
                classNames('bg-gradient border rounded p-1 m-0', mods, [className])}
            {...otherProps}
            style={{
                height: "100px",
                width: width
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
});