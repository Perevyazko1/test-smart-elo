import {Assignment} from "@entities/Assignment";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";
import {useMemo} from "react";

export const AssignmentInfoRow = (props: { assignment: Assignment }) => {
    const {assignment} = props;

    const getStatusProps = useMemo((): { bg: string, name: string } => {
        switch (assignment.status) {
            case 'await':
                return {bg: 'bg-light', name: 'В ожидании'}
            case 'in_work':
                return {bg: 'bg-primary', name: 'В работе'}
            case 'ready':
                if (assignment.inspector) {
                    return {bg: 'bg-success', name: 'Готов'}
                } else {
                    return {bg: 'bg-danger', name: 'Готов'}
                }
            case 'created':
                return {bg: 'bg-secondary', name: 'Создан'}
        }
    }, [assignment.inspector, assignment.status]);

    return (
        <tr>
            <td>
                {assignment.number}
            </td>

            <td>
                {assignment.appointed_by_boss && <i className="far fa-check-circle text-success"/>}
            </td>

            <td>
                {getEmployeeName(assignment.executor)}
            </td>


            <td className={getStatusProps.bg}>
                {getStatusProps.name}
            </td>


            <td>
                {getHumansDatetime(assignment.appointment_date || "")}
            </td>


            <td>
                {getHumansDatetime(assignment.date_completion || "")}
            </td>

            <td>
                {getEmployeeName(assignment.inspector)}
            </td>

            <td>
                {getHumansDatetime(assignment.inspect_date || "")}
            </td>

        </tr>
    );
};
