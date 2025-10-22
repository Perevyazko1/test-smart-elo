import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {getWeekData, useCardHeight} from "@pages/EqPage";

import {ReadySection} from "@pages/TaskPage";
import {EqCard} from "@widgets/EqCard";

import {useAppSelector, useCurrentUser, useFixedSizeList, useQueryParams, useQueue} from "@shared/hooks";
import {getHumansDatetime} from "@shared/lib";
import {AppSkeleton} from "@shared/ui";

import {useFetchListData} from "../model/api";
import {EqOrderProduct, ListTypes} from "../model/types";
import {EqControlPanel} from "@pages/EqPage/ui/EqBody/panel/EqControlPanel";
import {groupByPlanDate} from "@pages/EqPage/model/lib/groupByPlanDate";

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

    const weekData = useAppSelector(getWeekData);

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

    const getGroupMode = useCallback(() => {
        return !!localStorage.getItem(`${listType}`)
    }, [listType]);

    const listUpdated = useMemo(() => {
        return queryParameters.sortUpdated;
    }, [queryParameters.sortUpdated])

    useEffect(() => {
        if (getGroupMode() && data?.results) {
            setSortedList(groupByPlanDate(data.results, listType, currentUser))
        } else {
            setSortedList(data?.results.sort((a, b) => {
                const hasAssignmentsA = a.assignments.length !== 0 ? 1 : 0;
                const hasAssignmentsB = b.assignments.length !== 0 ? 1 : 0;
                const assignmentsDiff = hasAssignmentsB - hasAssignmentsA;

                if (assignmentsDiff !== 0) {
                    return assignmentsDiff;
                }

                // Условие для блока готовых
                if (listType === 'ready') {
                    const inspectorNullA = a.assignments.some(assignment => assignment.inspector === null) ? 1 : 0;
                    const inspectorNullB = b.assignments.some(assignment => assignment.inspector === null) ? 1 : 0;
                    const inspectorDiff = inspectorNullB - inspectorNullA;

                    if (inspectorDiff !== 0) {
                        return inspectorDiff;
                    }

                    if (currentUser.current_department_details?.piecework_wages) {
                        const hasTariffA = a.assignments.length > 0 ? a.assignments[0].new_tariff?.id ? 0 : 1 : 1;
                        const hasTariffB = b.assignments.length > 0 ? b.assignments[0].new_tariff?.id ? 0 : 1 : 1;

                        const tariffDiff = hasTariffB - hasTariffA;

                        if (tariffDiff !== 0) {
                            return tariffDiff;
                        }
                    }
                }

                const sortDateA = (a.assignments.length > 0 && a.assignments[0].sort_date) ?
                    new Date(a.assignments[0].sort_date) :
                    new Date(0);
                const sortDateB = (b.assignments.length > 0 && b.assignments[0].sort_date) ?
                    new Date(b.assignments[0].sort_date) :
                    new Date(0);

                const sortDateDiff = sortDateA.getTime() - sortDateB.getTime();
                if (sortDateA.getTime() === 0 && sortDateB.getTime() === 0) {
                    return 0;
                } else if (sortDateA.getTime() === 0) {
                    return 1;
                } else if (sortDateB.getTime() === 0) {
                    return -1;
                }
                if (sortDateDiff !== 0) {
                    return sortDateDiff;
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
        }
    }, [currentUser, currentUser.current_department_details?.piecework_wages, data, getGroupMode, listType, listUpdated]);


    // Делаем элемент управляемым, чтобы отслеживать положение скролла
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const getItemsCount = useMemo(() => {
        if (sortedList) {
            return sortedList.length;
        }
        return 0;
    }, [sortedList]);

    const {virtualItems, totalHeight} = useFixedSizeList({
        offsetTop: !!queryParameters.pro ? 28 : 0,
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
                key={card.series_id}
                targetUserId={targetUserId}
                noRelevant={queue.includes(card.id)}
                card={card}
                expanded={expanded}
                listType={listType}
            />
        )
    }, [expanded, listType, queue, sortedList, targetUserId])

    const planSum = data?.results.reduce(
        (acc, item) => {
            return acc + (item.price * item.assignments.length);
        }, 0
    );

    const planTiming = useMemo(() => {
        return data?.results.reduce(
            (acc, item) => {
                return acc + (item.card_info.timing * item.assignments.length)
            }, 0
        )
    }, [data])

    return (
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
                <EqControlPanel
                    listType={listType}
                    totalPlan={planSum ? Math.round(planSum) : 0}
                    totalTiming={planTiming ? Math.round(planTiming / 60) : 0}
                />

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
            {(listType === 'ready' && targetUserId && weekData?.dt_dates && weekData?.dt_dates.length > 6) &&
                <>
                    <div className={'fw-bold ps-1'}>
                        Выполненные задачи:
                    </div>
                    <ReadySection
                        eqMode={true}
                        targetUserId={targetUserId}
                        start_date={getHumansDatetime(weekData?.dt_dates[0], 'YYYY-MM-DD')}
                        end_date={getHumansDatetime(weekData?.dt_dates[6], 'YYYY-MM-DD')}
                    />
                </>
            }
        </div>
    );
});
