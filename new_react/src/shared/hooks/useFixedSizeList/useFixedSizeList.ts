import {useEffect, useLayoutEffect, useMemo, useState} from "react";

interface useFixedSizeListProps {
    itemsCount: number;
    itemHeight: number;
    overScan?: number;
    scrollingDelay?: number;
    getScrollElement: () => HTMLElement | null;
}

const DEFAULT_OVERSCAN = 3;
const DEFAULT_SCROLLING_DELAY = 100;

export const useFixedSizeList = (props: useFixedSizeListProps) => {
    const {
        itemsCount,
        itemHeight,
        overScan = DEFAULT_OVERSCAN,
        scrollingDelay = DEFAULT_SCROLLING_DELAY,
        getScrollElement,
    } = props;

    const [listHeight, setListHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

    useLayoutEffect(() => {
        const scrollElement = getScrollElement();

        if (!scrollElement) {
            return;
        }

        const resizeObserver = new ResizeObserver(([entry]) => {
            if (!entry) {
                return;
            }
            const height =
                entry.borderBoxSize[0].blockSize ??
                entry.target.getBoundingClientRect().height;

            setListHeight(height);
        })

        resizeObserver.observe(scrollElement);

        return () => {
            resizeObserver.disconnect();
        }
    }, [getScrollElement]);

    useLayoutEffect(() => {
        const scrollElement = getScrollElement();
        if (!scrollElement) {
            return;
        }

        const handleScroll = () => {
            const scrollTop = scrollElement.scrollTop;
            setScrollTop(scrollTop);
        }

        handleScroll();

        scrollElement.addEventListener('scroll', handleScroll);

        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [getScrollElement]);

    useEffect(() => {
        const scrollElement = getScrollElement();
        if (!scrollElement) {
            return;
        }

        let timeoutId: NodeJS.Timeout | null = null;
        const handleScroll = () => {
            setIsScrolling(true);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                setIsScrolling(false);
            }, scrollingDelay)
        }

        scrollElement.addEventListener('scroll', handleScroll);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [getScrollElement, scrollingDelay]);


    const {virtualItems, startIndex, endIndex} = useMemo(() => {
        const rangeStart = scrollTop;
        const rangeEnd = scrollTop + listHeight;

        let startIndex = Math.floor(rangeStart / itemHeight);
        let endIndex = Math.ceil(rangeEnd / itemHeight);

        startIndex = Math.max(0, startIndex - overScan);
        endIndex = Math.min(itemsCount - 1, endIndex + overScan);

        const virtualItems = [];

        for (let index = startIndex; index <= endIndex; index++) {
            virtualItems.push({
                index,
                offsetTop: index * itemHeight,
            })
        }

        return {virtualItems, startIndex, endIndex};
    }, [itemHeight, itemsCount, listHeight, overScan, scrollTop]);

    const totalHeight = itemHeight * itemsCount;

    return {virtualItems, startIndex, endIndex, isScrolling, totalHeight}
}