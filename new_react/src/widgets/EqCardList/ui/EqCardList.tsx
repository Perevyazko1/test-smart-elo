import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {useCardHeight} from "@pages/EqPage";
import {EqCard} from "@widgets/EqCard";
import {useCurrentUser, useFixedSizeList, useQueryParams, useQueue} from "@shared/hooks";
import {AppSkeleton} from "@shared/ui";

import {useFetchListData} from "../model/api";
import {EqOrderProduct, ListTypes} from "../model/types";
import {BlockName} from "./ui/BlockName";
import {ReadySection} from "@pages/TaskPage/ui/Sections/ReadySection";

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
    const {currentUser} = useCurrentUser();
    const {queryParameters} = useQueryParams();

    useEffect(() => {
        if (noRelevantIds.length > 0) {
            const newItem = noRelevantIds[noRelevantIds.length - 1];
            addToQueue(newItem);
        }
    }, [noRelevantIds, addToQueue]);

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

    // Делаем элемент управляемым, чтобы отслеживать положение скролла
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const getItemsCount = useMemo(() => {
        if (sortedList) {
            return sortedList.length;
        }
        return 0;
    }, [sortedList]);

    const {virtualItems, totalHeight} = useFixedSizeList({
        itemHeight: cardHeight + 3,
        itemsCount: getItemsCount,
        getScrollElement: useCallback(() => scrollElementRef.current, []),
    });

    const targetUserId = useMemo<number | undefined>(() => {
        let userId = undefined;
        if (listType !== 'await') {
            if (queryParameters.view_mode) {
                if (!['boss', 'unfinished', 'distribute'].includes(queryParameters.view_mode)) {
                    userId = Number(queryParameters.view_mode);
                }
            } else {
                userId = currentUser.id;
            }
        }
        return userId;
    }, [currentUser.id, listType, queryParameters.view_mode]);

    const getEqCard = useCallback((index: number) => {
        const card = sortedList[index];
        return (
            <EqCard
                targetUserId={targetUserId}
                noRelevant={queue.includes(card.id)}
                card={card}
                expanded={expanded}
                listType={listType}
            />
        )
    }, [expanded, listType, queue, sortedList, targetUserId])

    return (
        <>
            <div
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    height: '100%',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    position: "relative",
                }}
                ref={scrollElementRef}
            >
                <div style={{height: totalHeight}}>
                    {virtualItems.map(card => (
                        <div
                            key={card.index}
                            style={{
                                position: 'absolute',
                                top: '0',
                                transform: `translateY(${card.offsetTop}px)`,
                                width: '100%',
                                height: `${cardHeight}px`,
                            }}
                        >
                            {getEqCard(card.index)}
                        </div>
                    ))}
                </div>

                {isLoading ?
                    <AppSkeleton
                        className={'rounded'}
                        style={{
                            margin: '0.15rem 0.25rem',
                            height: `${cardHeight}px`,
                        }}
                    />
                    : null
                }
                {listType === 'ready' &&
                    <>
                        <div className={'fw-bold ps-1'}>
                            Выполненные задачи:
                        </div>
                        <ReadySection eqMode={true} targetUserId={targetUserId}/>
                    </>
                }
            </div>

            {blockName}
        </>
    );
});
