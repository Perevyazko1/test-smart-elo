import {Button, Spinner, Table} from "react-bootstrap";
import {useEditAssignmentInfo, useGetAssignmentInfo} from "../model/api/api";
import {useCurrentUser} from "@shared/hooks";
import {AssignmentInfoRow} from "@widgets/AssignmentInfo/ui/AssignmentInfoRow";
import React, {useMemo, useState} from "react";
import {AppSkeleton} from "@shared/ui";

interface AssignmentInfoProps {
    seriesId: string;
    title: string;
}

export const AssignmentInfo = (props: AssignmentInfoProps) => {
    const {seriesId, title} = props;

    const {currentUser} = useCurrentUser();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [inputDate, setInputDate] = useState<string>('');

    const {data, isLoading} = useGetAssignmentInfo({
        department__name: currentUser.current_department.name,
        order_product__series_id: seriesId,
    });

    const [editAssignments, {isLoading: isEdited, isError}] = useEditAssignmentInfo();

    const onSelectClb = (selectedId: number) => {
        if (selectedIds.includes(selectedId)) {
            setSelectedIds(selectedIds.filter(id => id !== selectedId))
        } else {
            setSelectedIds([...selectedIds, selectedId])
        }
    }

    const selectAll = () => {
        if (data && selectedIds.length !== data.length) {
            setSelectedIds(data.map(assignment => assignment.id));
        } else {
            setSelectedIds([]);
        }
    };

    const allSelected = useMemo(() => {
        return selectedIds.length === data?.length
    }, [data?.length, selectedIds.length])

    const PageSkeleton = useMemo(() => (
        <tr>
            <td colSpan={8}><AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/></td>
        </tr>
    ), []);

    const updateClb = (mode: 'in_work' | 'all' | 'selected' | 'await') => {
        editAssignments({
            series_id: seriesId,
            date: inputDate,
            ids: selectedIds,
            mode: mode,
        })
    }

    return (
        <div data-bs-theme={'light'}>
            <h5 className={'m-0 p-2'}>
                {isEdited || isLoading && <Spinner size={'sm'}/>}

                <b>Карточка: {seriesId} || Информация по нарядам: {title}</b>
            </h5>

            <hr className={'m-0 p-0'}/>

            <div className={'p-2'}>
                Назначить плановую дату на наряды в статусе:
                <br/>
                <div className={'gap-2'}>
                    <input
                        type="datetime-local"
                        className={'mx-2'}
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                    />
                    <Button
                        variant={'dark'}
                        size={'sm'}
                        className={'mx-2'}
                        disabled={isLoading || isEdited}
                        onClick={() => updateClb('all')}
                    >
                        Все наряды
                    </Button>
                    <Button
                        variant={'secondary'}
                        size={'sm'}
                        className={'mx-2'}
                        disabled={isLoading || isEdited}
                        onClick={() => updateClb('in_work')}
                    >
                        В работе
                    </Button>

                    <Button
                        variant={'outline-dark'}
                        size={'sm'}
                        className={'mx-2'}
                        disabled={isLoading || isEdited}
                        onClick={() => updateClb('await')}
                    >
                        В ожидании
                    </Button>
                    <Button
                        variant={'primary'}
                        size={'sm'}
                        className={'mx-2'}
                        disabled={isLoading || isEdited}
                        onClick={() => updateClb('selected')}
                    >
                        Выбранные
                    </Button>
                </div>
            </div>

            <Table size={'sm'} bordered striped hover>
                <thead>
                <tr>
                    <th>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={allSelected}
                            onChange={selectAll}
                        />
                    </th>
                    <th><i className="fas fa-lock fs-6"/></th>
                    <th>№ Бегунка</th>
                    <th>План</th>
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
                    <AssignmentInfoRow
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
