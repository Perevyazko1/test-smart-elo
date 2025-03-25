import {useLayoutEffect, useMemo, useState} from "react";

interface useFixedSizeListProps {
    offsetTop?: number;
    itemsCount: number;
    itemHeight: number;
    overScan?: number;
    getScrollElement: () => HTMLElement | null;
}

const DEFAULT_OVERSCAN = 5;

export const useFixedSizeList = (props: useFixedSizeListProps) => {
    const {
        offsetTop,
        itemsCount,
        itemHeight,
        overScan = DEFAULT_OVERSCAN,
        getScrollElement,
    } = props;

    const [listHeight, setListHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

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
                offsetTop: index * itemHeight + (offsetTop ? offsetTop : 0),
            })
        }

        return {virtualItems, startIndex, endIndex};
    }, [itemHeight, itemsCount, listHeight, overScan, scrollTop, offsetTop]);

    const totalHeight = itemHeight * itemsCount + (offsetTop ? offsetTop : 0);

    return {virtualItems, startIndex, endIndex, totalHeight}
}
