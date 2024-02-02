import React, {HTMLAttributes, useCallback, useMemo, useRef} from "react";

import {AppSkeleton} from "@shared/ui";
import {useAppSelector, useFixedSizeList} from "@shared/hooks";

import {getAwaitListInfo, getEqAwaitList} from "../../model/selectors/cardSelectors";
import {useCardHeight} from "../../model/lib/useCardHeight";
import {useFetchListData} from "../../model/lib/useFetchListData";
import {EqAwaitCard} from "../EqCards/EqAwaitCard";

interface EqAwaitSectionProps extends HTMLAttributes<HTMLDivElement> {
    height: number;
}

export const EqAwaitSection = (props: EqAwaitSectionProps) => {
    const {height} = props;

    // Получаем список изделий в ожидании и пропсы списка
    const awaitList = useAppSelector(getEqAwaitList.selectAll);
    const awaitProps = useAppSelector(getAwaitListInfo);

    // Получаем высоту карточки
    const cardHeight = useCardHeight();

    // Запрашиваем карточки с сервера. Карточки запрашиваются в 2 запроса.
    const {isLoading} = useFetchListData({
        listType: 'await',
        height,
    });

    // Делаем элемент управляемым, чтобы отслеживать положение скролла
    const scrollElementRef = useRef<HTMLDivElement>(null);
    
    const getItemsCount = useMemo(() => {
        return isLoading ? awaitProps.count || awaitList.length || 3 : awaitList.length
    }, [awaitList, awaitProps.count, isLoading]);

    // С помощью данного хука получаем виртуализированный список элементов
    const {virtualItems, totalHeight} = useFixedSizeList({
        itemHeight: cardHeight,
        itemsCount: getItemsCount,
        getScrollElement: useCallback(() => scrollElementRef.current, []),
    });

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
                    const item = awaitList[virtualItem.index];

                    if (!item) {
                        if (awaitProps.count === awaitList.length) {
                            return <div key={virtualItem.index}></div>
                        }

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
                            <EqAwaitCard card={item}/>
                        </div>
                    )
                })}
            </div>

        </div>
    );
};
