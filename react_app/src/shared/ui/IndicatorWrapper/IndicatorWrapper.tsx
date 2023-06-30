import {memo, ReactNode} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import cls from "./IndicatorWrapper.module.scss";

interface IndicatorWrapperProps {
    className?: string
    indicator: 'tech-process' | 'comment'
    children?: ReactNode
    show?: boolean
    top?: string
    right?: string
}


export const IndicatorWrapper = memo((props: IndicatorWrapperProps) => {
    const {
        className,
        children,
        indicator,
        top="0px",
        right="-9px",
        show = true,
    } = props

    if (!show) {
        return (
            <>{children}</>
        )
    }

    const mods: Mods = {};

    const getIndicatorIcon = () => {
        return indicator === 'tech-process'
            ?
            <i className="fas fa-sitemap"/>
            :
            <i className="far fa-comment-dots"/>
    }

    return (
        <div className={classNames(cls.wrapper)}>
            <div className={classNames(cls.indicator, mods, [className])}
                 style={{
                     top: top,
                     right: right,
                 }}
            >
                <div className={classNames(cls.iconWrapper)}>
                    {getIndicatorIcon()}
                </div>
            </div>
            {children}
        </div>
    );
});