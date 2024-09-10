import React, {useMemo, useState} from "react";
import {Spinner, Table} from "react-bootstrap";

import {useEmployeeList} from "@entities/Employee";
import {useCurrentUser} from "@shared/hooks";
import {AppSkeleton} from "@shared/ui";

import {useGetAssignmentInfo} from "../model/api/api";

import {SelectPanel} from "./AssignmentInfoPanel/SelectPanel";
import {CoExecutorPanel} from "./AssignmentInfoPanel/CoExecutorPanel";
import {EditPanel} from "./AssignmentInfoPanel/EditPanel";
import {AssignmentInfoRow} from "./AssignmentInfoRow";

interface AssignmentInfoProps {
    seriesId: string;
    title: string;
}

export const AssignmentInfo = (props: AssignmentInfoProps) => {
    const {seriesId, title} = props;

    const {currentUser} = useCurrentUser();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const {data, isLoading} = useGetAssignmentInfo({
        department__id: currentUser.current_department?.id || 100,
        order_product__series_id: seriesId,
    });

    const {data: userList} = useEmployeeList({
        departments: [currentUser.current_department?.id],
        is_staff: false,
    });

    const onSelectClb = (selectedId: number) => {
        if (selectedIds.includes(selectedId)) {
            setSelectedIds(selectedIds.filter(id => id !== selectedId))
        } else {
            setSelectedIds([...selectedIds, selectedId])
        }
    };

    const allSelected = useMemo(() => {
        return selectedIds.length === data?.length
    }, [data?.length, selectedIds.length]);

    const PageSkeleton = useMemo(() => (
        <tr>
            <td colSpan={currentUser.current_department?.piecework_wages ? 12 : 11}>
                <AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/>
            </td>
        </tr>
    ), [currentUser.current_department?.piecework_wages]);



    return (
        <div data-bs-theme={'light'} className={'pb-2'}>
            <h5 className={'m-0 p-2'}>
                {(isLoading) && <Spinner size={'sm'}/>}

                <b>Серия: {seriesId} || Информация по нарядам: {title}</b>
            </h5>


            <div className={'d-flex flex-column gap-2'}>
                <hr className={'m-0 p-0'}/>

                <SelectPanel
                    selectedIds={selectedIds}
                    data={data}
                    setSelectedIds={setSelectedIds}
                />

                <hr className={'m-0 p-0'}/>

                <div className={'d-flex flex-column gap-2 fs-7 p-1'}>
                    Редактировать выбранные:
                    <CoExecutorPanel
                        data={data}
                        selectedIds={selectedIds}
                        userList={userList}
                    />

                    <hr className={'m-0 p-0'}/>

                    <EditPanel
                        selectedIds={selectedIds}
                        seriesId={seriesId}
                        data={data}
                    />

                    <hr className={'m-0 mb-1 p-0'}/>
                </div>
            </div>


            <Table size={'sm'} bordered>
                <thead>
                <tr>
                    <th>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={allSelected}
                            readOnly
                        />
                    </th>
                    <th><i className="fas fa-lock fs-6"/></th>
                    <th>№</th>
                    <th>План</th>
                    <th>Исполнитель</th>
                    <th>Исп.(доп)</th>
                    <th>Статус</th>
                    <th>Взят в работу</th>
                    <th>Дата готовности</th>
                    <th>Проверяющий</th>
                    <th>Дата визирования</th>
                    {currentUser.current_department?.piecework_wages && <th>Тариф</th>}

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
                    <AssignmentInfoRow
                        userList={userList || []}
                        assignment={assignment}
                        key={assignment.id}
                        onSelect={onSelectClb}
                        selected={selectedIds.includes(assignment.id)}
                    />
                ))}
                </tbody>
            </Table>
        </div>
    );
};
