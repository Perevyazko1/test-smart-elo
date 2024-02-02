import {useDepDetails} from "@pages/EqPage/model/api/opDepDetailsApi";
import {useCurrentUser} from "@shared/hooks";
import {Table} from "react-bootstrap";

interface EqDepDetailsProps {
    seriesId: string;
}


export const EqDepDetails = (props: EqDepDetailsProps) => {
    const {seriesId} = props;

    const {currentUser} = useCurrentUser();

    const {data, isLoading} = useDepDetails({
        series_id: seriesId,
        department_number: currentUser.current_department.number,
    });

    return (
        <div>
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
};
