import React, {HTMLAttributes, useMemo} from "react";
import {useDrop} from "react-dnd";
import {DayInfo} from "@pages/EqPage/model/lib/getNextDays";
import {useEditAssignmentInfo} from "@widgets/AssignmentInfo/model/api/api";
import {EqOrderProduct} from "@widgets/EqCardList";
import {useAppQuery, useCurrentUser} from "@shared/hooks";
import {EqNumberListTipe} from "@widgets/EqCard/model/lib/createEqNumberLists";
import {IDragItemCard} from "@pages/EqPage/model/types";


interface AreaGhostProps extends HTMLAttributes<HTMLDivElement> {
    dayInfo: DayInfo;
    item: IDragItemCard;
    bg?: string;
    current_load: number | null;
    total_units_day: number | null;
}

export const AreaGhost = (props: AreaGhostProps) => {
    const {dayInfo, style, bg = '#3f87b8', current_load = 0, total_units_day, item, ...otherProps} = props;

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
    
    const loadPercent = useMemo(() => {
        if (!total_units_day || current_load === null) {
            return null;
        }
        if (!isOver) {
            return Math.ceil(current_load / total_units_day * 100);
        }
        const newLoad = item.card.card_info.timing * (
            item.assignmentsLists.primary.length + item.assignmentsLists.selectedLocked.length
        );
        return Math.ceil((current_load + newLoad) / total_units_day * 100);
    }, [
        current_load,
        isOver,
        item.assignmentsLists.primary.length,
        item.assignmentsLists.selectedLocked.length,
        item.card.card_info.timing,
        total_units_day
    ])
    
    

    return (
        <div
            ref={drop}
            style={{
                fontSize: 24,
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
            <div className={'bg-info-subtle p-1'} style={{width: `${loadPercent}%`, minWidth: "fit-content"}}>
                {loadPercent ? `${loadPercent}%` : ""}
            </div>
        </div>
    );
};