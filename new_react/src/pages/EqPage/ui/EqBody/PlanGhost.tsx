import React from "react";
import {useDragLayer} from 'react-dnd';

import {DayInfo, getNextDays} from "@pages/EqPage/model/lib/getNextDays";
import {AreaGhost} from "@pages/EqPage/ui/EqBody/AreaGhost";
import {EqOrderProduct} from "@widgets/EqCardList";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";


interface PlanGhostProps {
    leftBlockWidth: number;
}

export const PlanGhost = (props: PlanGhostProps) => {
    const {leftBlockWidth} = props;

    const {itemType, currentOffset, item} = useDragLayer((monitor) => ({
        itemType: monitor.getItemType(),
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
    }));


    const days = getNextDays(7);

    const rows: DayInfo[] = [
        {
            day: "Убрать плановую дату",
            dtDay: null,
        },
        ...days,
    ]

    return (
        <div style={{
            width: '100%',
            height: '100%',
            zIndex: 1000,
            position: 'relative',
            right: 0,
            display: itemType === 'eq_card' ? 'flex' : 'none',
        }} className={'flex-wrap gap-1 flex-column'}>
            {item && itemType === 'eq_card' && (
                <div
                    className={'bg-info p-3'}
                    style={{
                        position: "absolute",
                        left: currentOffset?.x,
                        top: currentOffset?.y,
                        zIndex: 1003,
                    }}>
                    <span>{(item.assignmentsLists as EqNumberListTipe).primary.length} шт. - {(item.card as EqOrderProduct).product.name}</span>
                    <br/>
                    <span>{(item.card as EqOrderProduct).order.project} {(item.card as EqOrderProduct).order.inner_number}</span>
                </div>
            )}


            {rows.map((day) => (
                <AreaGhost
                    key={day.day}
                    dayInfo={day}
                />
            ))}

            <div
                className={'h-100 bg-danger'}
                style={{
                    position: 'absolute',
                    width: '2px',
                    height: '100%',
                    left: leftBlockWidth,
                    zIndex: 1002,
                }}
            />

            <div style={{
                opacity: 0.95,
                background: "var(--bs-gray-800)",
                width: '100%',
                height: '100%',
                zIndex: 1001,
                position: 'absolute',
            }}/>

        </div>
    );
};