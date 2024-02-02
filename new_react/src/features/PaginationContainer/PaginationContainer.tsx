import {HTMLAttributes, MutableRefObject, ReactNode, useEffect, useRef} from 'react';
import {useInfiniteScroll} from "@shared/hooks";


interface PaginationContainerProps extends HTMLAttributes<HTMLDivElement> {
    hasMore: boolean,
    scroll_callback: () => void,
    skeleton?: ReactNode,
    hasUpdated: boolean,
}


export const PaginationContainer = (props: PaginationContainerProps) => {
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


    return (
        <div
            className={props.className}
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