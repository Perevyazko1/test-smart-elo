import {AppSkeleton} from "@shared/ui";

import {useGetTarifficationStory} from "../model/api";
import {Table} from "react-bootstrap";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";

interface TarifficationStoryWidgetProps {
    production_step__id: number;
}


export const TarifficationStoryWidget = (props: TarifficationStoryWidgetProps) => {
    const {data, isLoading} = useGetTarifficationStory({
        production_step__id: props.production_step__id
    });

    const Skeleton = () => (
        <tr>
            <td><AppSkeleton/></td>
            <td><AppSkeleton/></td>
            <td><AppSkeleton/></td>
            <td><AppSkeleton/></td>
            <td><AppSkeleton/></td>
        </tr>
    )

    return (
        <div style={{minWidth: '50vw'}} data-bs-theme={'light'}>
            <h5><b>История тарифов</b></h5>

            <Table bordered hover>
                <thead>
                <tr>
                    <th>
                        ID
                    </th>
                    <th>
                        Сумма
                    </th>
                    <th>
                        Инициатор
                    </th>

                    <th>
                        Дата
                    </th>

                    <th>
                        Описание
                    </th>
                </tr>
                </thead>

                <tbody>

                {data?.map(tariff => (
                        <tr key={tariff.id}>
                            <td>
                                {tariff.id}
                            </td>
                            <td>
                                {tariff.amount.toLocaleString('ry-RU')}
                            </td>
                            <td>
                                {getEmployeeName(tariff.created_by)}
                            </td>
                            <td>
                                {getHumansDatetime(tariff.add_date)}
                            </td>
                            <td style={{
                                backgroundColor:
                                    `${tariff.comment.includes('Предложен')
                                        ? "#fff591"
                                        : "#9cff91"
                                    }`
                            }}>
                                {tariff.comment}
                            </td>
                        </tr>
                    )
                )}

                {isLoading &&
                    <>
                        <Skeleton/>
                        <Skeleton/>
                        <Skeleton/>
                    </>
                }
                </tbody>

            </Table>
        </div>
    )
        ;
};
