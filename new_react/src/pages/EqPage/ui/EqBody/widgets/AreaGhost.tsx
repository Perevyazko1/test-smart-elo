import React, { HTMLAttributes } from "react";
import {useDrop} from "react-dnd";
import {DayInfo} from "@pages/EqPage/model/lib/getNextDays";
import {useEditAssignmentInfo} from "@widgets/AssignmentInfo/model/api/api";
import {EqOrderProduct} from "@widgets/EqCardList";
import {useAppQuery, useCurrentUser} from "@shared/hooks";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";

interface AreaGhostProps extends HTMLAttributes<HTMLDivElement> {
    dayInfo: DayInfo,
    bg?: string,
}

export const AreaGhost = (props: AreaGhostProps) => {
    const {dayInfo, style, bg='#3f87b8', ...otherProps} = props;

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
            ref={drop}
            style={{
                fontSize: 32,
                zIndex: 1002,
                left: "2px",
                backgroundColor: isOver ? "green" : bg,
                ...style,
            }}
            {...otherProps}
        >
            <div className={'bg-danger-subtle p-2'}>
                {dayInfo.day}
            </div>
        </div>
    );
};