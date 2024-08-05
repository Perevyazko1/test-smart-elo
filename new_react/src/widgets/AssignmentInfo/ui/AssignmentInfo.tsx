import {Spinner, Table} from "react-bootstrap";
import {useEditAssignmentInfo, useGetAssignmentInfo} from "../model/api/api";
import {useAppDispatch, useCurrentUser, usePermission} from "@shared/hooks";
import {AssignmentInfoRow} from "@widgets/AssignmentInfo/ui/AssignmentInfoRow";
import React, {useEffect, useMemo, useState} from "react";
import {AppSkeleton} from "@shared/ui";
import {APP_PERM} from "@shared/consts";
import {eqPageActions} from "@pages/EqPage";
import {getEmployeeName} from "@shared/lib";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {useEmployeeList} from "@widgets/TaskForm/model/api";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {AppRangeInput} from "@shared/ui/AppRangeInput";

interface AssignmentInfoProps {
    seriesId: string;
    title: string;
}

export const AssignmentInfo = (props: AssignmentInfoProps) => {
    const {seriesId, title} = props;
    const dispatch = useAppDispatch();

    const {currentUser} = useCurrentUser();
    const unconfirmedPerm = usePermission(APP_PERM.ASSIGNMENT_UNCONFIRMED);
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);
    const [coExecutorTax, setCoExecutorTax] = useState<number>(0);

    const {data: userList} = useEmployeeList({
        departments: [currentUser.current_department?.id],
        is_staff: false,
    });

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [inputDate, setInputDate] = useState<string>('');

    const {data, isLoading} = useGetAssignmentInfo({
        department__id: currentUser.current_department?.id || 100,
        order_product__series_id: seriesId,
    });

    const [editAssignments, {isLoading: isEdited, error}] = useEditAssignmentInfo();

    interface ServerError {
        data?: {
            error?: string
        }
    }

    useEffect(() => {
        if (error) {
            const serverError = error as ServerError;
            alert(serverError?.data?.error || 'Ошибка сервера. Обратитесь к администратору.')
        }
    }, [error])
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
            <td colSpan={11}><AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/></td>
        </tr>
    ), []);

    const updateClb = (mode: 'in_work' | 'all' | 'selected' | 'await' | 'remove_visa') => {
        if (currentUser.current_department) {
            editAssignments({
                series_id: seriesId,
                department__id: currentUser.current_department.id,
                date: inputDate,
                ids: selectedIds,
                mode: mode,
            }).then(() => {
                dispatch(eqPageActions.weekDataHasUpdated());
            })
        }
    }

    return (
        <div data-bs-theme={'light'}>
            <h5 className={'m-0 p-2'}>
                {(isEdited || isLoading) && <Spinner size={'sm'}/>}

                <b>Серия: {seriesId} || Информация по нарядам: {title}</b>
            </h5>


            {/*<div className={'d-flex flex-column gap-1'}>*/}
            {/*    <hr className={'m-0 p-0'}/>*/}
            {/*    <div className={'d-flex fs-7 gap-2 align-items-center'}>*/}
            {/*        Выделить:*/}
            {/*        <button className={'appBtn fs-7 p-1'}>*/}
            {/*            Все*/}
            {/*        </button>*/}

            {/*        <button className={'appBtn fs-7 p-1'}>*/}
            {/*            В работе*/}
            {/*        </button>*/}
            {/*        <button className={'appBtn fs-7 p-1'}>*/}
            {/*            В ожидании*/}
            {/*        </button>*/}
            {/*    </div>*/}

            {/*    <hr className={'m-0 p-0'}/>*/}

            {/*    <div className={'d-flex flex-column gap-1 fs-7 p-1'}>*/}
            {/*        Редактировать выбранные:*/}
            {/*        <div className={'fs-7'}>*/}
            {/*            Добавить соисполнителя:*/}
            {/*            <div className={'p-1 d-flex gap-2 align-items-center'}>*/}
            {/*                <button className={'appBtn circleBtn greenBtn fs-7 p-1'}>*/}
            {/*                    <PersonAddIcon fontSize={'small'}/>*/}
            {/*                </button>*/}

            {/*                <AppAutocomplete*/}
            {/*                    variant={'select'}*/}
            {/*                    value={userList ? userList[0] : null}*/}
            {/*                    options={userList || []}*/}
            {/*                    label={'доп.исп'}*/}
            {/*                    width={240}*/}
            {/*                    getOptionLabel={option => getEmployeeName(option, 'listNameInitials')}*/}
            {/*                />*/}

            {/*                <AppRangeInput*/}
            {/*                    maxValue={data ? data[0].new_tariff?.amount || 0 : 0}*/}
            {/*                    value={coExecutorTax}*/}
            {/*                    setValue={setCoExecutorTax}*/}
            {/*                />*/}

            {/*            </div>*/}
            {/*        </div>*/}

            {/*        <hr className={'m-0 p-0'}/>*/}

            {/*        <div className={'d-flex fs-7 gap-2 align-items-center'}>*/}
            {/*            Сделка:*/}
            {/*            <button className={'appBtn fs-7 p-1'}>*/}
            {/*                Распределить сделку*/}
            {/*            </button>*/}
            {/*            Наряды:*/}
            {/*            <button*/}
            {/*                className={'appBtn fs-7 p-1'}*/}
            {/*                disabled={isLoading || isEdited || !unconfirmedPerm}*/}
            {/*                onClick={() => updateClb('remove_visa')}*/}
            {/*            >*/}
            {/*                Снять визу*/}
            {/*            </button>*/}

            {/*            {!isViewer &&*/}
            {/*                <>*/}
            {/*                    Плановая дата:*/}
            {/*                    <input*/}
            {/*                        type="datetime-local"*/}
            {/*                        value={inputDate}*/}
            {/*                        onChange={(e) => setInputDate(e.target.value)}*/}
            {/*                    />*/}

            {/*                    <button*/}
            {/*                        className={'appBtn fs-7 p-1'}*/}
            {/*                        disabled={isLoading || isEdited}*/}
            {/*                    >*/}
            {/*                        Назначить*/}
            {/*                    </button>*/}
            {/*                </>*/}
            {/*            }*/}
            {/*        </div>*/}

            {/*    </div>*/}
            {/*</div>*/}


            <Table size={'sm'} bordered>
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
                    <th>Исп.(доп)</th>
                    <th>Статус</th>
                    <th>Взят в работу</th>
                    <th>Дата готовности</th>
                    <th>Проверяющий</th>
                    <th>Дата визирования</th>
                    <th>Тариф</th>
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
