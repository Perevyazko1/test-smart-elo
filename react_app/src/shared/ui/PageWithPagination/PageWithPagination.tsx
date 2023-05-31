import {HTMLAttributes, MutableRefObject, useRef} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useInfiniteScroll} from "../../lib/hooks/useInfiniteScroll/useInfiniteScroll";

interface PageWithPaginationProps extends HTMLAttributes<HTMLDivElement> {
    hasMore: boolean,
    scroll_callback: () => void,
}


export const PageWithPagination = (props: PageWithPaginationProps) => {
    const {
        hasMore,
        scroll_callback,
        ...otherProps
    } = props
    const wrapperRef = useRef() as MutableRefObject<HTMLDivElement>
    const triggerRef = useRef() as MutableRefObject<HTMLDivElement>


    useInfiniteScroll({
        callback: () => hasMore ? scroll_callback() : false,
        triggerRef: triggerRef,
        wrapperRef: wrapperRef
    })

    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [props.className])}
            ref={wrapperRef}
            {...otherProps}
        >
            {props.children}
            <div ref={triggerRef}></div>
        </div>
    );
};