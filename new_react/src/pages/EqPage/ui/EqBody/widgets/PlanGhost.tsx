import React, {useMemo} from "react";
import {useDragLayer} from 'react-dnd';

import {DayInfo, getNextDays} from "@pages/EqPage/model/lib/getNextDays";
import {AreaGhost} from "@pages/EqPage/ui/EqBody/widgets/AreaGhost";
import {EqOrderProduct} from "@widgets/EqCardList";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";


export const PlanGhost = () => {
    const {itemType, currentOffset, item} = useDragLayer((monitor) => ({
        itemType: monitor.getItemType(),
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    const {days, emptyCells} = useMemo(() => {
        const days = getNextDays(31);
        const firstDay = new Date(days[0].dtDay!).getDay() - 1;
        const emptyCells = Array(Math.max(0, firstDay)).fill(null); // Защита от отрицательного firstDay
        return {days, emptyCells};
    }, []);

    const isWeekend = (dayInfo: DayInfo) => {
        const date = new Date(dayInfo.dtDay!);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Воскресенье (0) или суббота (6)
    };

    if (itemType !== "eq_card") return null;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            zIndex: 1000,
            position: 'relative',
            right: 0,
            display: 'flex',
        }}>
            {item && (
                <div
                    className={'bg-info p-3'}
                    style={{
                        position: "absolute",
                        left: currentOffset?.x,
                        top: currentOffset?.y,
                        zIndex: 1005,
                    }}>
                    <span>{(item.assignmentsLists as EqNumberListTipe).primary.length} шт. - {(item.card as EqOrderProduct).product.name}</span>
                    <br/>
                    <span>{(item.card as EqOrderProduct).order.project} {(item.card as EqOrderProduct).order.inner_number}</span>
                </div>
            )}

            <div className={'d-flex flex-wrap gap-1 flex-column h-100 p-1'} style={{zIndex: 1003, width: '50%'}}>
                <AreaGhost
                    dayInfo={{
                        day: "Убрать плановую дату",
                        dtDay: null,
                    }}
                    bg={'#ae714c'}
                    className={'border border-2 border-danger p-2 text-white'}
                />
                <div className={'h-50 flex-fill calendarBox gap-1'} style={{zIndex: 1003}}>
                    {emptyCells.map((_, index) => (
                        <div key={`empty-${index}`} className="border border-2 border-secondary p-2 text-white">
                        </div>
                    ))}

                    {days.map((dayInfo) => (
                        <AreaGhost
                            key={dayInfo.day}
                            dayInfo={dayInfo}
                            style={{
                                fontSize: 16,
                            }}
                            bg={isWeekend(dayInfo) ? '#ae714c' : undefined}
                            className={'border border-2 p-2 text-white border-danger'}
                        />
                    ))}
                </div>

            </div>

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