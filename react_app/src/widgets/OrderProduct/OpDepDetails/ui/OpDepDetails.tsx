import {memo} from 'react';
import {Table} from "react-bootstrap";
import {useSelector} from "react-redux";

import {getCurrentDepartment} from "entities/Employee";

import {useDepDetails} from "../api/api";

interface OpDepDetailsProps {
    seriesId: string;
    className?: string;
}


export const OpDepDetails = memo((props: OpDepDetailsProps) => {
    const {
        seriesId,
        className,
    } = props;

    const currentDepartment = useSelector(getCurrentDepartment)
    const {data, isLoading} = useDepDetails({
        series_id: seriesId,
        department_number: currentDepartment?.number,
    });

    return (
        <div className={className}>
            {isLoading ? 'Загрузка...' :
                <Table striped bordered hover>

                    <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>В работе</th>
                        <th>Готово</th>
                        <th>Подтверждено</th>
                    </tr>
                    </thead>

                    <tbody>
                    {data?.department_info.map((info) => (
                        <tr key={info.id}>
                            <td>{info.full_name}</td>
                            <td className={"fw-bolder"}>{info.in_work > 0 ? info.in_work : ""}</td>
                            <td className={"fw-bolder"}>{info.ready > 0 ? info.ready : ""}</td>
                            <td className={"fw-bolder"}>{info.confirmed > 0 ? info.confirmed : ""}</td>
                        </tr>
                    ))}
                    </tbody>

                </Table>
            }
        </div>
    );
});