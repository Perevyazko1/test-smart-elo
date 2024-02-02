import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ButtonGroup, Container, Dropdown, DropdownButton, Spinner, Table} from "react-bootstrap";

import cls from './AssignmentPage.module.scss';

import {DynamicComponent, PaginationContainer, QueryContext, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";
import {Assignment} from "@entities/Assignment";
import {AppDropdown, AppInput, AppSkeleton} from "@shared/ui";
import {
    useAppDispatch,
    useAppSelector,
    useCurrentUser,
    useDebounce,
    usePermission,
    useQueryParams
} from "@shared/hooks";
import {getPaginationSize} from "@shared/lib";

import {getAssignmentList, getAssignmentProps} from "../model/selectors/assignmentSelector";
import {fetchAssignments} from "../model/service/fetchAssignments";
import {assignmentPageActions, assignmentPageReducer} from "../model/slice/assignmentPageSlice";
import {updateAssignments} from "../model/service/updateAssignments";
import {APP_PERM} from "@shared/consts";
import {ModalProvider} from "@app";


const initialReducers: ReducersList = {
    assignments: assignmentPageReducer,
}

export const AssignmentPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam, initialLoad} = useQueryParams();
    const unconfirmedPerm = usePermission(APP_PERM.ASSIGNMENT_UNCONFIRMED);

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
    const allDepartment = 'Все отделы';

    // Инициализируем отдел если таков был в query параметрах
    const getInitialDepartment = useCallback((): string => {
        const queryDepartmentName = queryParameters.department__name;
        if (queryDepartmentName) {
            return currentUser.departments?.find(department => department.name === queryDepartmentName)?.name || allDepartment;
        } else {
            return allDepartment;
        }
    }, [allDepartment, currentUser.departments, queryParameters.department__name]);

    const [currentDepartment, setCurrentDepartment] = useState<string>(getInitialDepartment());
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
            console.log('Пошел запрос')
            getAssignments(true);
        }
        //eslint-disable-next-line
    }, [limitOffset]);

    // Инициализируем параметры при загрузке страницы и запрашиваем данные
    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize, offset: 0})
            getAssignments(false, paginationSize, 0);
            dispatch(assignmentPageActions.listHasUpdated());
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters]);

    // Коллбек установки следующей страницы
    const setNextPage = () => {
        console.log('Изменение номера страницы')
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize,
        })
    }

    // Метод для группового обновления выделенных нарядов - снятие визы
    // После запроса делаем повторный запрос всего списка
    const groupUpdateAssignments = () => {
        if (currentUser.pin_code) {
            dispatch(updateAssignments({
                action: "remove_confirmation",
                id_list: checkedId,
                pin_code: currentUser.pin_code,
            })).then(() => {
                getAssignments(false, limitOffset.offset + limitOffset.limit, 0)
            })
        }
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


    const departments = useMemo(
        () => currentUser.departments.map(department => department.name),
        [currentUser.departments]
    );

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

    const setDepartmentClb = (department: string) => {
        setCurrentDepartment(department);
        if (department !== allDepartment) {
            setQueryParam('department__name', department)
        } else {
            setQueryParam('department__name', '')
        }
    };


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
                                selected={currentDepartment}
                                active={currentDepartment !== allDepartment}
                                items={[allDepartment, ...departments]}
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

                                <DropdownButton
                                    as={ButtonGroup}
                                    size="sm"
                                    drop={'end'}
                                    variant="secondary"
                                    title="Редактировать выбранные наряды"
                                    className={'mb-2'}
                                    disabled={checkedId.length === 0}
                                >
                                    {unconfirmedPerm &&
                                        <Dropdown.Item
                                            eventKey="1"
                                            onClick={groupUpdateAssignments}
                                        >
                                            Снять визирование
                                        </Dropdown.Item>
                                    }
                                </DropdownButton>
                                <hr className={'mt-0'}/>
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
                                                        <td>13.07.2022</td>
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
