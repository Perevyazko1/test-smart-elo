import {memo} from 'react';
import {Table} from "react-bootstrap";

import {useProdDetails} from "../api/api";

interface OpProdDetailsProps {
    seriesId: string;
    className?: string;
}


export const OpProdDetails = memo((props: OpProdDetailsProps) => {
    const {
        seriesId,
        className,
    } = props;

    const {data, isLoading} = useProdDetails({
        series_id: seriesId,
    });

    return (
        <div className={className}>
            {isLoading ? 'Загрузка...' :
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Отдел</th>
                        <th>В работе</th>
                        <th>Готово</th>
                        <th>Подтверждено</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.production_info?.map((info) => (
                        <tr key={info.department_name}>
                            <td>{info.department_name}</td>
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