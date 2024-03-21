import React, {HTMLAttributes, useCallback, useMemo, useRef} from "react";

import {AppSkeleton} from "@shared/ui";
import {useAppSelector, useFixedSizeList} from "@shared/hooks";

import {getEqInWorkList, getInWorkListInfo} from "../../model/selectors/cardSelectors";
import {useCardHeight} from "../../model/lib/useCardHeight";
import {useFetchListData} from "../../model/lib/useFetchListData";
import {EqInWorkCard} from "../EqCards/EqInWorkCard";

interface EqInWorkSectionProps extends HTMLAttributes<HTMLDivElement> {
    height: number;
}

export const EqInWorkSection = (props: EqInWorkSectionProps) => {
    const {height} = props;

    // Получаем список изделий в ожидании и пропсы списка
    const inWorkList = useAppSelector(getEqInWorkList.selectAll);
    const inWorkProps = useAppSelector(getInWorkListInfo);

    // Получаем высоту карточки
    const cardHeight = useCardHeight();

    // Запрашиваем карточки с сервера. Карточки запрашиваются в 2 запроса.
    useFetchListData({
        listType: 'in_work',
        height,
        deps: [inWorkProps.hasUpdated],
    });

    // Делаем элемент управляемым, чтобы отслеживать положение скролла
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const getItemsCount = useMemo(() => {
        return inWorkProps.isLoading ? inWorkProps.count || inWorkList.length || 3 : inWorkList.length
    }, [inWorkList.length, inWorkProps.count, inWorkProps.isLoading])

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
                    const item = inWorkList[virtualItem.index];

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
                            <EqInWorkCard card={item}/>
                        </div>
                    )
                })}
            </div>

        </div>
    );
};
