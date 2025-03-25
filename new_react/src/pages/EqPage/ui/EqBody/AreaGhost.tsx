import React from "react";
import {useDrop} from "react-dnd";
import {DayInfo} from "@pages/EqPage/model/lib/getNextDays";
import {useEditAssignmentInfo} from "@widgets/AssignmentInfo/model/api/api";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";
import {EqOrderProduct} from "@widgets/EqCardList";
import {useCurrentUser} from "@shared/hooks";

interface AreaGhostProps {
    cardHeight: number,
    offsetTop: string,
    dayInfo: DayInfo,
}

export const AreaGhost = (props: AreaGhostProps) => {
    const {offsetTop, dayInfo, cardHeight} = props;

    const [editAssignments] = useEditAssignmentInfo();
    const {currentUser} = useCurrentUser();

    const [{isOver}, drop] = useDrop({
        accept: 'eq_card',
        drop: (item: { assignmentsLists: EqNumberListTipe, card: EqOrderProduct }) => {
            if (item && currentUser.current_department?.id) {
                editAssignments({
                    ids: item.assignmentsLists.primary.map(assignment => assignment.id),
                    date: dayInfo.dtDay || '',
                    department__id: currentUser.current_department.id,
                    series_id: item.card.series_id,
                    mode: 'selected'
                })
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            className={'border border-2 border-danger p-2 text-white'}
            ref={drop}
            style={{
                position: 'absolute',
                fontSize: 32,
                zIndex: 1002,
                top: offsetTop,
                left: "2px",
                height: cardHeight,
                width: 'calc(50% - 4px)',
                backgroundColor: isOver ? "green" : "blue",
            }}
        >
            <span className={'bg-danger-subtle p-1'}>
                {dayInfo.day}
            </span>
        </div>
    );
};