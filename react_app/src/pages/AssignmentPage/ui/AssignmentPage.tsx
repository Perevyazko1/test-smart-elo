import React, {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ButtonGroup, Container, Dropdown, DropdownButton, Nav, Spinner, Table} from "react-bootstrap";

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
import {DepartmentFilter} from "widgets/DepartmentFilter/ui/DepartmentFilter";
import {
    EmployeePermissions,
    getEmployeeDepartments,
    getEmployeeHasPermissions,
    getEmployeePinCode
} from "entities/Employee";
import {department} from "entities/Department";

import {assignmentPageActions, assignmentPageReducer} from "../model/slice/assignmentPageSlice";

import {fetchAssignments} from "../model/service/fetchAssignments";
import {getAssignmentList, getAssignmentProps} from "../model/selectors/assignmentSelector";

import cls from './AssignmentPage.module.scss';
import {updateAssignments} from "../model/service/updateAssignments";

const initialReducers: ReducersList = {
    assignments: assignmentPageReducer,
}


const AssignmentPage = () => {
    const dispatch = useAppDispatch();
    const pinCode = useAppSelector(getEmployeePinCode)
    const unconfirmedPermission = useAppSelector(getEmployeeHasPermissions([
        EmployeePermissions.ASSIGNMENT_UNCONFIRMED,
    ]))

    const location = useLocation();
    const navigate = useNavigate();

    const paginationSize = useCallback(() => {
        return getPaginationSize(window.innerHeight, 30, 1.6);
    }, [])

    const [limitOffset, setLimitOffset] = useState({limit: paginationSize(), offset: 0});

    const assignmentsList = useAppSelector(getAssignmentList.selectAll);
    const assignmentsProps = useAppSelector(getAssignmentProps);

    const params = new URLSearchParams(location.search);

    const [seriesIdInput, setSeriesIdInput] = useState<string>(params.get('order_product__series_id') || '')
    const [checkedId, setCheckedId] = useState<number[]>([])


    const allDepartment: department = {number: 100, name: 'Все отделы'}
    const departments = useAppSelector(getEmployeeDepartments)
    const getInitialDepartment = (): department => {
        const queryDepartmentName = params.get('department__name')
        if (queryDepartmentName) {
            return departments?.find(department => department.name === queryDepartmentName) || allDepartment;
        } else {
            return allDepartment;
        }
    }
    const [currentDepartment, setCurrentDepartment] = useState<department>(getInitialDepartment())

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
    }

    useEffect(() => {
        const isNext = limitOffset.offset >= paginationSize();
        getAssignments(isNext);
        //eslint-disable-next-line
    }, [limitOffset])

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize()
        })
    }

    const groupUpdateAssignments = () => {
        if (pinCode) {
            dispatch(updateAssignments({
                action: "remove_confirmation",
                id_list: checkedId,
                pin_code: pinCode,
            })).then(() => {
                getAssignments(false, limitOffset.offset + limitOffset.limit, 0)
            })
        }

    }

    const setQueryParam = (param: string, value: string) => {
        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }
        setLimitOffset({limit: paginationSize(), offset: 0})
        navigate({...location, search: params.toString()});
        dispatch(assignmentPageActions.listHasUpdated())
    }

    const debouncedSetSeriesIdFilter = useDebounce(
        setQueryParam,
        500
    )

    useEffect(() => {
        debouncedSetSeriesIdFilter('order_product__series_id', seriesIdInput)
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


                        <AppInput placeholder={'Номер серии'}
                                  className={'my-auto ms-3 my-1'}
                                  onChange={(event) => setSeriesIdInput(event.target.value)}
                                  value={seriesIdInput}
                                  inputSize={'sm'}
                        />

                        <DepartmentFilter
                            currentDepartment={currentDepartment}
                            departments={departments}
                            additionalDepartments={[allDepartment]}
                            setDepartmentCallback={(department) => {
                                setCurrentDepartment(department);
                                setQueryParam(
                                    'department__name',
                                    department.name === 'Все отделы' ? "" : department.name
                                )
                            }}
                            className={'my-auto ms-2 my-1'}
                        />

                        <UpdatePageBtn
                            className={'ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1 bg-body-tertiary px-3'}
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
                    hasUpdated={!!assignmentsProps.hasUpdated}
                    data-bs-theme={'light'}
                    className={classNames(cls.pageContent, {}, ['container mt-1'])}
                    hasMore={!!assignmentsProps.next}
                    scroll_callback={setNextPage}
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
                        <div className="d-flex align-items-center">
                            <h3>
                                Страница работы с нарядами

                            </h3>
                            {assignmentsProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}
                        </div>
                        <hr className={'p-0 m-2 w-25'}/>

                        <DropdownButton
                            as={ButtonGroup}
                            size="sm"
                            drop={'end'}
                            variant="secondary"
                            title="Редактировать выбранные наряды"
                            className={'mb-2'}
                        >
                            {unconfirmedPermission &&
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