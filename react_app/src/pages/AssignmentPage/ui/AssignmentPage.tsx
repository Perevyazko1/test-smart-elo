import React, {useCallback, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ButtonGroup, Container, Dropdown, DropdownButton, Nav, Table} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {extendedAssignment} from "entities/Assignment";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {classNames} from "shared/lib/classNames/classNames";
import {getPaginationSize} from "shared/api/configs";
import {useDebounce} from "shared/lib/hooks/useDebounce/useDebounce";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {AppInput} from "shared/ui/AppInput/AppInput";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";

import {assignmentPageReducer} from "../model/slice/assignmentPageSlice";

import {fetchAssignments} from "../model/service/fetchAssignments";
import {getAssignmentList, getAssignmentProps} from "../model/selectors/assignmentSelector";

import cls from './AssignmentPage.module.scss';
import {updateAssignments} from "../model/service/updateAssignments";

const initialReducers: ReducersList = {
    assignments: assignmentPageReducer,
}


const AssignmentPage = () => {
    const dispatch = useAppDispatch();

    const location = useLocation();
    const navigate = useNavigate();
    const assignmentsList = useAppSelector(getAssignmentList.selectAll);
    const assignmentsProps = useAppSelector(getAssignmentProps);

    const params = new URLSearchParams(location.search);

    const [seriesIdInput, setSeriesIdInput] = useState<string>(params.get('order_product__series_id') || '')
    const [checkedId, setCheckedId] = useState<number[]>([])

    const editTargetAssignmentId = (id: number, checked: boolean) => {
        if (checked) {
            setCheckedId([...checkedId, id])
        } else {
            setCheckedId(checkedId.filter(element => element !== id))
        }
    }

    const queryParameters = Array.from(params.entries()).reduce((acc, [key, value]) => {
        return {...acc, [key]: value};
    }, {});

    const prevParamsRef = useRef<any>(null);

    const getAssignments = () => {
        dispatch(fetchAssignments({
            isNext: false,
            limit: getPaginationSize(window.innerHeight, 30, 1.6),
            offset: 0,
            ...queryParameters,
        }))
    }

    const fetchNextPage = () => {
        console.log(assignmentsProps.next)
        if (assignmentsProps.next) {
            dispatch(fetchAssignments({
                isNext: true,
                url: assignmentsProps.next,
            }))
        }
    }

    const groupUpdateAssignments = () => {
        dispatch(updateAssignments({
            action: "remove_confirmation",
            id_list: checkedId,
        }))
    }

    useEffect(() => {
        if (prevParamsRef.current === null || JSON.stringify(queryParameters) !== JSON.stringify(prevParamsRef.current)) {
            getAssignments();
            prevParamsRef.current = queryParameters;
        }
        // eslint-disable-next-line
    }, [params, queryParameters]);

    const setSeriesIdFilter = () => {
        if (seriesIdInput) {
            params.set('order_product__series_id', seriesIdInput);
        } else {
            params.delete('order_product__series_id');
        }
        navigate({...location, search: params.toString()});
    }

    const debouncedSetSeriesIdFilter = useDebounce(
        setSeriesIdFilter,
        500
    )

    useEffect(() => {
        debouncedSetSeriesIdFilter()
        // eslint-disable-next-line
    }, [seriesIdInput])


    const getStatusProps = useCallback((assignment: extendedAssignment): { bg: string, name: string } => {
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
        }

    }, [])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Container className={classNames(cls.pageContainer, {}, [])}
                       fluid
                       data-bs-theme={'dark'}
            >
                <AppNavbar>
                    <Nav className="me-auto">

                        <UpdatePageBtn
                            className={'ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1 bg-body-tertiary px-3'}
                        />

                        <AppInput placeholder={'Номер серии'}
                                  className={'my-auto mx-3 my-1'}
                                  onChange={(event) => setSeriesIdInput(event.target.value)}
                                  value={seriesIdInput}
                                  inputSize={'sm'}
                        />

                    </Nav>

                    <Nav>
                        <UserInfoWithRouts
                            className={"ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1"}
                            active
                        />
                    </Nav>

                </AppNavbar>


                <PageWithPagination
                    data-bs-theme={'light'}
                    className={classNames(cls.pageContent, {}, ['container mt-1'])}
                    hasMore={!!assignmentsProps.next}
                    scroll_callback={fetchNextPage}
                    skeleton={
                        <Skeleton
                            height={'25px'}
                            width={'100%'}
                            rounded={false}
                            className={'mb-2 scaled'}
                            pagination_size={3}
                        />}
                >
                    <div className={classNames(cls.stickyWrapper, {}, ['bg-light'])}>
                        <h3 className={""}>Страница работы с нарядами</h3>
                        <hr className={'p-0 m-2 w-25'}/>

                        <DropdownButton
                            as={ButtonGroup}
                            size="sm"
                            drop={'end'}
                            variant="secondary"
                            title="Редактировать выбранные наряды"
                            className={'mb-2'}
                        >
                            <Dropdown.Item
                                eventKey="1"
                                onClick={groupUpdateAssignments}
                            >
                                Снять визирование
                            </Dropdown.Item>
                        </DropdownButton>
                        <hr className={'mt-0'}/>
                    </div>


                    {assignmentsProps.isLoading && assignmentsList.length === 0 ?
                        <Skeleton
                            height={'25px'}
                            width={'100%'}
                            rounded={false}
                            className={'mb-2 scaled'}
                            pagination_size={3}
                        /> :
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

                            {assignmentsList.map((assignment) => (
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
                            ))}

                            </tbody>
                        </Table>
                    }
                </PageWithPagination>

            </Container>
        </DynamicModuleLoader>
    );
};

export default AssignmentPage;