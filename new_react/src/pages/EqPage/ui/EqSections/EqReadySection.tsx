import React, {HTMLAttributes, useCallback, useMemo, useRef} from "react";

import {AppSkeleton} from "@shared/ui";
import {useAppQuery, useAppSelector, useFixedSizeList} from "@shared/hooks";

import {getEqReadyList, getReadyListInfo} from "../../model/selectors/cardSelectors";
import {useCardHeight} from "../../model/lib/useCardHeight";
import {useFetchListData} from "../../model/lib/useFetchListData";

import {EqReadyCard} from "../EqCards/EqReadyCard";

interface EqReadySectionProps extends HTMLAttributes<HTMLDivElement> {
    height: number;
}

export const EqReadySection = (props: EqReadySectionProps) => {
    const {height} = props;

    // Получаем список изделий в ожидании и пропсы списка
    const readyList = useAppSelector(getEqReadyList.selectAll);
    const sortedReadyList = useMemo(() => {
        return readyList.sort((a, b) => {
            // Проверяем, есть ли в 'a.assignments' хотя бы один 'assignment' с 'inspector' равным 'null'
            const aHasNullInspector = a.assignments.some(assignment => assignment.inspector === null);

            // Проверяем то же самое для 'b'
            const bHasNullInspector = b.assignments.some(assignment => assignment.inspector === null);

            if (aHasNullInspector && !bHasNullInspector) {
                // Если 'a' имеет 'null inspector', а 'b' нет, 'a' должен быть первым
                return -1;
            } else if (!aHasNullInspector && bHasNullInspector) {
                // Если 'b' имеет 'null inspector', а 'a' нет, 'b' должен быть первым
                return 1;
            }
            // Если оба имеют 'null inspector' или оба не имеют, сохраняем их порядок
            return 0;
        });
    }, [readyList])

    const readyProps = useAppSelector(getReadyListInfo);
    const {queryParameters} = useAppQuery();

    // Получаем высоту карточки
    const cardHeight = useCardHeight();

    // Запрашиваем карточки с сервера. Карточки запрашиваются в 2 запроса.
    useFetchListData({
        listType: 'ready',
        height,
        deps: [
            queryParameters.week,
            readyProps.hasUpdated,
        ],
    });

    // Делаем элемент управляемым, чтобы отслеживать положение скролла
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const getItemsCount = useMemo(() => {
        return readyProps.isLoading ? readyProps.count || readyList.length || 3 : readyList.length
    }, [readyProps.isLoading, readyList.length, readyProps.count])

    // С помощью данного хука получаем виртуализированный список элементов
    const {virtualItems, totalHeight} = useFixedSizeList({
        itemHeight: cardHeight,
        itemsCount: getItemsCount,
        getScrollElement: useCallback(() => scrollElementRef.current, []),
    })

    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            position: "relative",
        }}
             ref={scrollElementRef}
        >
            {/* Вешаем отслеживатель скролла на обертку блока */}
            <div style={{height: `${totalHeight}px`}}>

                {virtualItems.map((virtualItem) => {
                    const item = sortedReadyList[virtualItem.index];

                    if (!item) {
                        return (
                            <AppSkeleton className={'rounded pt-1'} style={{
                                height: `${cardHeight}px`,
                                width: '100%',
                                position: 'absolute',
                                paddingLeft: '0.05rem',
                                paddingRight: '0.15rem',
                                top: '0',
                                transform: `translateY(${virtualItem.offsetTop}px)`,
                            }} key={virtualItem.index}/>
                        )
                    }

                    return (
                        <div style={{
                            height: `${cardHeight}px`,
                            position: 'absolute',
                            top: '0',
                            transform: `translateY(${virtualItem.offsetTop}px)`,
                            width: '100%',
                        }} key={item.id}>
                            <EqReadyCard card={item}/>
                        </div>
                    )
                })}
            </div>

        </div>
    );
};
