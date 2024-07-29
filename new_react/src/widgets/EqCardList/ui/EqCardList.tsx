import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {useCardHeight} from "@pages/EqPage";
import {useFixedSizeList, useQueue} from "@shared/hooks";

import {useFetchListData} from "../model/api";
import {EqOrderProduct, ListTypes} from "../model/types";
import {BlockName} from "./ui/BlockName";
import { VirtualizedList } from "./ui/VirtualizedList";

interface EqCardListProps {
    extraParams?: object;
    listType: ListTypes;
    deps: any[];
    inited: boolean;
    expanded?: boolean;
    noRelevantIds?: number[];
}


export const EqCardList = memo((props: EqCardListProps) => {
    const {listType, inited, expanded = false, noRelevantIds = [], deps, extraParams} = props;

    const {addToQueue, processNext, queue} = useQueue();

    useEffect(() => {
        if (noRelevantIds.length > 0) {
            const newItem = noRelevantIds[noRelevantIds.length - 1];
            addToQueue(newItem);
        }
    }, [noRelevantIds, addToQueue]);

    // Делаем элемент управляемым, чтобы отслеживать положение скролла
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const {isLoading, data, updateItem} = useFetchListData({
        inited: inited,
        deps: deps,
        height: 1200,
        listType: listType,
        extraParams: extraParams,
    });

    useEffect(() => {
        if (queue.length > 0) {
            updateItem(queue[0]).then(processNext)
        }
    }, [processNext, queue, updateItem]);

    // Получаем высоту карточки
    const cardHeight = useCardHeight();
    const [sortedList, setSortedList] = useState<EqOrderProduct[]>([]);

    useEffect(() => {
        setSortedList(data?.results.sort((a, b) => {
            const hasAssignmentsA = a.assignments.length !== 0 ? 1 : 0;
            const hasAssignmentsB = b.assignments.length !== 0 ? 1 : 0;
            const assignmentsDiff = hasAssignmentsB - hasAssignmentsA;

            if (assignmentsDiff !== 0) {
                return assignmentsDiff;
            }

            const urgencyDiff = a.urgency - b.urgency;
            if (urgencyDiff !== 0) {
                return urgencyDiff;
            }

            const orderNumberDiff = a.order.id - b.order.id;
            if (orderNumberDiff !== 0) {
                return orderNumberDiff;
            }

            return a.id - b.id;
        }) || [])
    }, [data]);

    const getItemsCount = useMemo(() => {
        return isLoading ? data?.count || sortedList.length || 3 : sortedList.length;
    }, [data?.count, isLoading, sortedList.length]);

    const {virtualItems, totalHeight} = useFixedSizeList({
        itemHeight: cardHeight,
        itemsCount: getItemsCount,
        getScrollElement: useCallback(() => scrollElementRef.current, []),
    });

    const blockName = useMemo(() => {
        return (listType !== "distribute" &&
            <BlockName
                name={
                    listType === "in_work" ? 'В РАБОТЕ' :
                        listType === 'await' ? "В ОЖИДАНИИ" :
                            "ГОТОВЫЕ"
                }
            />
        )
    }, [listType]);

    return (
        <>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    position: "relative",
                }}
                ref={scrollElementRef}
            >

                {/* Вешаем отслеживатель скролла на обертку блока */}
                <VirtualizedList
                    expanded={expanded}
                    listType={listType}
                    height={data?.results && data.results.length > 0 ? totalHeight + 5 : 0}
                    queue={queue}
                    virtualItems={virtualItems}
                    sortedList={sortedList}
                />
            </div>

            {blockName}
        </>
    );
});
