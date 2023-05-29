import {MutableRefObject, useEffect, useRef} from "react";

export interface UseInfiniteScrollProps {
    callback: () => void;
    triggerRef: MutableRefObject<HTMLElement | null>;
    wrapperRef: MutableRefObject<HTMLElement | null>;
}

export const useInfiniteScroll = ({callback, triggerRef, wrapperRef}: UseInfiniteScrollProps) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const options = {
            root: wrapperRef.current,
            rootMargin: '0px',
            threshold: 1.0
        }

        const currentTriggerRef = triggerRef.current

        if (currentTriggerRef && wrapperRef.current) {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    callbackRef.current();
                }
            }, options);

            observer.observe(currentTriggerRef);

            return () => {
                if (currentTriggerRef) {
                    observer.unobserve(currentTriggerRef);
                }
            }
        }
    }, [triggerRef, wrapperRef]);
}
