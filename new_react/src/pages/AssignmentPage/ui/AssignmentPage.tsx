import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Container, Spinner, Table} from "react-bootstrap";

import cls from './AssignmentPage.module.scss';

import {ModalProvider} from "@app";
import {Assignment} from "@entities/Assignment";
import {DynamicComponent, PaginationContainer, QueryContext, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";
import {AppDropdown, AppInput, AppSkeleton} from "@shared/ui";
import {useAppDispatch, useAppSelector, useCurrentUser, useDebounce, useQueryParams} from "@shared/hooks";
import {getHumansDatetime, getPaginationSize} from "@shared/lib";

import {getAssignmentList, getAssignmentProps} from "../model/selectors/assignmentSelector";
import {fetchAssignments} from "../model/service/fetchAssignments";
import {assignmentPageActions, assignmentPageReducer} from "../model/slice/assignmentPageSlice";
import {Department} from "@entities/Department";


const initialReducers: ReducersList = {
    assignments: assignmentPageReducer,
}

export const AssignmentPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam, initialLoad} = useQueryParams();

    // Считаем размер страницы для одного запроса
    const paginationSize = useMemo(() => {
        return getPaginationSize(window.innerHeight, 30, 1.6);
    }, []);

    // Состояние текущего запроса
    const [limitOffset, setLimitOffset] = useState({limit: paginationSize, offset: 0});
    // Массив с выбранными номерами нарядов
    const [checkedId, setCheckedId] = useState<number[]>([]);

    const assignmentProps = useAppSelector(getAssignmentProps);
    const assignmentList = useAppSelector(getAssignmentList.selectAll);


    // Делаем затычку для выбора всех отделов
    const allDepartment: Department = useMemo(() => {
        return {
            id: 0,
            name: 'Все отделы',
            piecework_wages: false,
            color: 'FFFFFF',
            number: 0,
            single: false
        }
    }, []);

    // Инициализируем отдел если таков был в query параметрах
    const getInitialDepartment = useCallback((): Department => {
        const queryDepartmentName = queryParameters.department__id;
        if (queryDepartmentName) {
            return currentUser.departments?.find(department => String(department.id) === queryDepartmentName) || allDepartment;
        } else {
            return allDepartment;
        }
    }, [allDepartment, currentUser.departments, queryParameters.department__id]);

    const [currentDepartment, setCurrentDepartment] = useState<Department>(getInitialDepartment());
    const [seriesIdInput, setSeriesIdInput] = useState<string>(queryParameters.order_product__series_id || '');

    // Выделение нарядов
    const editTargetAssignmentId = (id: number, checked: boolean) => {
        if (checked) {
            setCheckedId([...checkedId, id])
        } else {
            setCheckedId(checkedId.filter(element => element !== id))
        }
    };

    // Флаг isNext нужен для дальнейшей обработки в редьюсерах
    const getAssignments = (
        isNext: boolean = false,
        limit: number = limitOffset.limit,
        offset: number = limitOffset.offset
    ) => {
        dispatch(fetchAssignments({
            isNext: isNext,
            limit: limit,
            offset: offset,
            ...queryParameters,
        }))
    };

    // При изменении интервала страницы запрашиваем данные
    useEffect(() => {
        if (limitOffset.offset >= paginationSize) {
            getAssignments(true);
        }
        //eslint-disable-next-line
    }, [limitOffset]);

    // Инициализируем параметры при загрузке страницы и запрашиваем данные
    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize, offset: 0});
            getAssignments(false, paginationSize, 0);
            dispatch(assignmentPageActions.listHasUpdated());
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters]);

    // Коллбек установки следующей страницы
    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize,
        })
    }

    // Дебаунсим изменение поисковой строки
    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );
    useEffect(() => {
        debouncedSetQueryParam('order_product__series_id', seriesIdInput)
        // eslint-disable-next-line
    }, [seriesIdInput]);

    const PageSkeletons = useMemo(() => (
        <>
            <tr>
                <td colSpan={9}><AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={9}><AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={9}><AppSkeleton style={{height: '25px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
        </>
    ), [])

    // Трансформируем статус в понятную информацию
    const getStatusProps = useCallback((assignment: Assignment): { bg: string, name: string } => {
        switch (assignment.status) {
            case 'await':
                return {bg: 'bg-light', name: 'В ожидании'}
            case 'in_work':
                return {bg: 'bg-primary', name: 'В работе'}
            case 'ready':
                if (assignment.inspector) {
                    return {bg: 'bg-success', name: 'Готов'}
                } else {
                    return {bg: 'bg-danger', name: 'Готов'}
                }
            case 'created':
                return {bg: 'bg-secondary', name: 'Создан'}
        }
    }, []);

    const setDepartmentClb = (departmentName: string) => {
        const selectedDepartment = currentUser.departments.find(department => department.name === departmentName)
        setCurrentDepartment(selectedDepartment || allDepartment);
        if (selectedDepartment) {
            setQueryParam('department__id', String(selectedDepartment.id))
        } else {
            setQueryParam('department__id', '')
        }
    };

    const departmentItems = useMemo(() => {
        return currentUser.departments.map(department => department.name)
    }, [currentUser.departments])

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            <QueryContext>
                <ModalProvider>
                    <div className={cls.pageContainer}>
                        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                            <AppInput placeholder={'Номер серии'}
                                      className={'my-auto ms-3'}
                                      onChange={(event) => setSeriesIdInput(event.target.value)}
                                      value={seriesIdInput}
                            />

                            <AppDropdown
                                selected={currentDepartment.name}
                                active={currentDepartment !== allDepartment}
                                items={[allDepartment.name, ...departmentItems]}
                                onSelect={setDepartmentClb}
                            />
                        </AppNavbar>

                        <PaginationContainer
                            hasMore={!!assignmentProps.next}
                            scroll_callback={setNextPage}
                            hasUpdated={!!assignmentProps.hasUpdated}
                            data-bs-theme={'light'}
                            className={cls.pageContent}
                        >
                            <div className={cls.stickyWrapper}>
                                <div className="d-flex align-items-center p-2">
                                    <h4 className={'m-0'}>
                                        Страница работы с нарядами
                                        {assignmentProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}
                                    </h4>
                                </div>
                                <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
                            </div>

                            <Container>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                    <tr>
                                        <th className={'d-flex justify-content-center'}>
                                            #
                                        </th>
                                        <th>№</th>
                                        <th>Серия</th>
                                        <th>Отдел</th>
                                        <th>Статус</th>
                                        <th>Тарификация</th>
                                        <th>Исполнитель</th>
                                        <th>Дата готовности</th>
                                        <th>Проверяющий</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {assignmentProps.isLoading && assignmentList.length === 0 ?
                                        <>{PageSkeletons}</>
                                        :
                                        <>
                                            {
                                                assignmentList.map((assignment) => (
                                                    <tr key={assignment.id}>
                                                        <td className={'d-flex justify-content-center'}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                onChange={(event) => editTargetAssignmentId(
                                                                    assignment.id,
                                                                    event.currentTarget.checked
                                                                )}
                                                                checked={checkedId.includes(assignment.id)}
                                                            />
                                                        </td>
                                                        <td>{assignment.number}</td>
                                                        <td>{assignment.order_product.series_id}</td>
                                                        <td>{assignment.department.name}</td>
                                                        <td className={getStatusProps(assignment).bg}>
                                                            {getStatusProps(assignment).name}
                                                        </td>
                                                        <td>{assignment.tariff?.tariff} </td>
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
                                                    </tr>
                                                ))
                                            }
                                            {!!assignmentProps.next && PageSkeletons}
                                        </>

                                    }
                                    </tbody>
                                </Table>

                            </Container>

                        </PaginationContainer>
                    </div>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
