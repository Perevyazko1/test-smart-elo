import {Table} from "react-bootstrap";
import {useGetAssignmentInfo} from "../model/api/api";
import {useCurrentUser} from "@shared/hooks";
import {AssignmentInfoRow} from "@widgets/AssignmentInfo/ui/AssignmentInfoRow";
import React, {useMemo} from "react";
import {AppSkeleton} from "@shared/ui";

interface AssignmentInfoProps {
    seriesId: string;
    title: string;
}

export const AssignmentInfo = (props: AssignmentInfoProps) => {
    const {seriesId, title} = props;

    const {currentUser} = useCurrentUser();

    const {data, isLoading} = useGetAssignmentInfo({
        department__name: currentUser.current_department.name,
        order_product__series_id: seriesId,
    })

    const PageSkeleton = useMemo(() => (
        <tr>
            <td colSpan={8}><AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/></td>
        </tr>
    ), [])

    return (
        <div data-bs-theme={'light'}>
            <h5>
                <b>Карточка: {seriesId} || Информация по нарядам: {title}</b>
            </h5>


            <Table size={'sm'} bordered striped hover>
                <thead>
                <tr>
                    <th>№ Бегунка</th>
                    <th><i className="fas fa-lock fs-6"/></th>
                    <th>Исполнитель</th>
                    <th>Статус</th>
                    <th>Взят в работу</th>
                    <th>Дата готовности</th>
                    <th>Проверяющий</th>
                    <th>Дата визирования</th>
                </tr>
                </thead>

                <tbody>
                {isLoading &&
                    <>
                        {PageSkeleton}
                        {PageSkeleton}
                        {PageSkeleton}
                    </>}

                {data?.map(assignment => (
                    <AssignmentInfoRow assignment={assignment} key={assignment.id}/>
                ))}
                </tbody>
            </Table>
        </div>
    );
};
