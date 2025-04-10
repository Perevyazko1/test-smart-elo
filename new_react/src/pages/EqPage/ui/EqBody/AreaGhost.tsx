import React from "react";
import {useDrop} from "react-dnd";
import {DayInfo} from "@pages/EqPage/model/lib/getNextDays";
import {useEditAssignmentInfo} from "@widgets/AssignmentInfo/model/api/api";
import {EqOrderProduct} from "@widgets/EqCardList";
import {useAppQuery, useCurrentUser} from "@shared/hooks";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";

interface AreaGhostProps {
    dayInfo: DayInfo,
}

export const AreaGhost = (props: AreaGhostProps) => {
    const {dayInfo} = props;

    const [editAssignments] = useEditAssignmentInfo();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam} = useAppQuery();

    const [{isOver}, drop] = useDrop({
        accept: 'eq_card',
        drop: (item: { assignmentsLists: EqNumberListTipe, card: EqOrderProduct }) => {
            if (item && currentUser.current_department?.id) {
                const assignments = [...item.assignmentsLists.primary, ...item.assignmentsLists.selectedLocked];
                editAssignments({
                    ids: assignments.map(assignment => assignment.id),
                    date: dayInfo.dtDay || '',
                    department__id: currentUser.current_department.id,
                    series_id: item.card.series_id,
                    mode: 'selected'
                }).then(() => {
                    setQueryParam("sortUpdated", queryParameters.sortUpdated ? "" : "updated");
                })
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            className={'border border-2 border-danger p-2 text-white flex-fill'}
            ref={drop}
            style={{
                fontSize: 32,
                zIndex: 1002,
                left: "2px",
                // height: cardHeight,
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