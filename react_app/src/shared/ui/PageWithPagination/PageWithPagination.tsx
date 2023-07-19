import {HTMLAttributes, MutableRefObject, ReactNode, useEffect, useRef} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useInfiniteScroll} from "../../lib/hooks/useInfiniteScroll/useInfiniteScroll";

interface PageWithPaginationProps extends HTMLAttributes<HTMLDivElement> {
    hasMore: boolean,
    scroll_callback: () => void,
    skeleton?: ReactNode,
    hasUpdated: boolean,
}


export const PageWithPagination = (props: PageWithPaginationProps) => {
    const {
        hasMore,
        scroll_callback,
        skeleton,
        hasUpdated,
        ...otherProps
    } = props;
    const wrapperRef = useRef() as MutableRefObject<HTMLDivElement>
    const triggerRef = useRef() as MutableRefObject<HTMLDivElement>

    useInfiniteScroll({
        callback: () => hasMore ? scroll_callback() : false,
        triggerRef: triggerRef,
        wrapperRef: wrapperRef
    })

    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTop = 0;
        }
    }, [hasUpdated])

    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [props.className])}
            ref={wrapperRef}
            {...otherProps}
        >
            {props.children}

            <div ref={triggerRef}/>

            {hasMore &&
                <div>
                    {skeleton}
                </div>
            }
        </div>
    );
};