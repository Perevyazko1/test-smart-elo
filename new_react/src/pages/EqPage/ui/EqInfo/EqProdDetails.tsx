import {Table} from "react-bootstrap";

import {useProdDetails} from "../../model/api/opProdDetailsApi";

interface EqProdDetailsProps {
    seriesId: string;
}

export const EqProdDetails = (props: EqProdDetailsProps) => {
    const {seriesId} = props;

    const {data, isLoading} = useProdDetails({
        series_id: seriesId,
    });

    return (
        <div>
            {isLoading ? 'Загрузка...' :
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Отдел</th>
                        <th>Ожидает</th>
                        <th>В работе</th>
                        <th>Готово</th>
                        <th>Подтверждено</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.production_info?.map((info) => (
                        <tr key={info.department_name}>
                            <td>{info.department_name}</td>
                            <td className={"fw-bolder"}>{info.await > 0 ? info.await : ""}</td>
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
};
