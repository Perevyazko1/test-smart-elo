import {ReactNode, useMemo} from 'react';

import cls from "./IndicatorWrapper.module.scss";

interface IndicatorWrapperProps {
    indicator: 'tech-process' | 'comment';
    children?: ReactNode;
    color: ' bg-danger' | ' bg-warning';
    show?: boolean;
    top?: string;
    right?: string;
}


export const IndicatorWrapper = (props: IndicatorWrapperProps) => {
    const {
        children,
        indicator,
        top="-1px",
        right="-12px",
        show = true,
        color,
    } = props;

    const getIndicatorIcon = useMemo(() => {
        return indicator === 'tech-process'
            ?
            <i className="fas fa-sitemap"/>
            :
            <i className="far fa-comment-dots"/>
    }, [indicator])

    if (!show) {
        return (
            <>{children}</>
        )
    }

    return (
        <div className={cls.wrapper}>
            <div className={cls.indicator + color}
                 style={{
                     top: top,
                     right: right,
                 }}
            >
                <div className={cls.iconWrapper}>
                    {getIndicatorIcon}
                </div>
            </div>
            {children}
        </div>
    );
};