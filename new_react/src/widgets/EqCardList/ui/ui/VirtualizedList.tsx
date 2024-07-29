import React, { useCallback } from "react";
import { EqOrderProduct, ListTypes } from "@widgets/EqCardList";
import {EqCard} from "@widgets/EqCard";
import {AppSkeleton} from "@shared/ui";
import {useCardHeight} from "@pages/EqPage";

interface VirtualizedListProps {
    sortedList: EqOrderProduct[];
    virtualItems: any[]; // замените на ваш тип данных
    height: number;
    expanded: boolean;
    listType: ListTypes;
    queue: number[]; // замените на ваш тип данных
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
    sortedList,
    virtualItems,
    height,
    expanded,
    listType,
    queue
}) => {
    const getEqCard = useCallback((item: EqOrderProduct) => (
        <EqCard
            noRelevant={queue.includes(item.id)}
            card={item}
            expanded={expanded}
            listType={listType}
        />
    ), [expanded, listType, queue]);

    // Получаем высоту карточки
    const cardHeight = useCardHeight();

    return (
        <div style={{ height: `${height}px` }}>
            {virtualItems.map((virtualItem) => {
                const item = sortedList[virtualItem.index];

                if (!item) {
                    return (
                        <AppSkeleton
                            className={'rounded pt-1'}
                            style={{
                                height: `${cardHeight}px`,
                                width: '100%',
                                position: 'absolute',
                                paddingLeft: '0.05rem',
                                paddingRight: '0.15rem',
                                top: '0',
                                transform: `translateY(${virtualItem.offsetTop}px)`,
                            }}
                            key={virtualItem.index}
                        />
                    );
                }

                return (
                    <div
                        style={{
                            height: `${cardHeight}px`,
                            position: 'absolute',
                            top: '0',
                            transform: `translateY(${virtualItem.offsetTop}px)`,
                            width: '100%',
                        }}
                        key={item.id}
                    >
                        {getEqCard(item)}
                    </div>
                );
            })}
        </div>
    );
};


