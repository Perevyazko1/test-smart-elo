import React, {ReactNode, useMemo} from "react";

import {Assignment} from "@entities/Assignment";
import {getHumansDatetime} from "@shared/lib";
import {Input} from "@mui/material";


interface AssignmentPageTableRowProps {
    assignment: Assignment;
}

export const AssignmentPageTableRow = (props: AssignmentPageTableRowProps) => {
    const {assignment} = props;


    const getStatusProps = useMemo((): { icon: ReactNode, name: string } => {
        switch (assignment.status) {
            case 'await':
                return {icon: '', name: 'В ожидании'}
            case 'in_work':
                return {icon: <i className="fas fa-tools text-warning me-2 fs-6"/>, name: 'В работе'}
            case 'ready':
                if (assignment.inspector) {
                    return {icon: <i className="far fa-check-circle text-success me-2 fs-6"/>, name: 'Готов'}
                } else {
                    return {icon: <i className="far fa-check-circle text-danger me-2 fs-6"/>, name: 'Готов'}
                }
            case 'created':
                return {icon: '', name: 'Создан'}
        }
    }, [assignment.inspector, assignment.status]);

    return (
        <tr className={'align-middle fs-7'}>
            <td>{assignment.number}</td>
            <td>{assignment.order_product.series_id}</td>
            <td>{assignment.department.name}</td>

            <td className={'text-nowrap'}>
                {getStatusProps.icon}
                <b>{getStatusProps.name}</b>
            </td>

            <td>
                <Input
                    value={assignment.new_tariff?.amount || ''}
                    size="small"
                    readOnly
                    sx={{
                        width: 100,
                        fontSize: 12,
                    }}
                    className={'fw-bold'}
                    inputProps={{
                        type: 'number',
                        sx: {
                            padding: 0,
                        }
                    }}
                />
            </td>
            <td>
                {
                    `${assignment.executor?.last_name || ""} 
                                            ${assignment.executor?.first_name || ""}`
                }
            </td>
            <td>{getHumansDatetime(assignment.date_completion || '')}</td>
            <th>
                {
                    `${assignment.inspector?.last_name || ""} 
                                            ${assignment.inspector?.first_name || ""}`
                }
            </th>
            <td>{getHumansDatetime(assignment.inspect_date || '')}</td>
        </tr>
    );
};
