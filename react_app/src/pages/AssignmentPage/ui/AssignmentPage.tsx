import React, {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ButtonGroup, Container, Dropdown, Nav, SplitButton, Table} from "react-bootstrap";

import {AppRoutes, getAppRouteConfig} from "app/providers/Router";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {classNames} from "shared/lib/classNames/classNames";

import {assignmentPageReducer} from "../model/slice/assignmentPageSlice";

import cls from './AssignmentPage.module.scss';
import {fetchAssignments} from "../model/service/fetchAssignments";
import {useAppSelector} from "../../../shared/lib/hooks/useAppSelector/useAppSelector";
import {getAssignmentList} from "../model/selectors/assignmentSelector";


const initialReducers: ReducersList = {
    assignments: assignmentPageReducer,
}


const AssignmentPage = () => {
    const dispatch = useAppDispatch();

    const roteConfig = getAppRouteConfig(AppRoutes.ASSIGNMENTS);
    const location = useLocation();
    const navigate = useNavigate();
    const assignmentsList = useAppSelector(getAssignmentList.selectAll)

    const params = new URLSearchParams(location.search);
    const orderBy = params.get('order_by');

    const setOrderBy = () => {
        params.set('order_product__series_id', '{1}23913');
        navigate({...location, search: params.toString()});
    }

    const queryParameters = Array.from(params.entries()).reduce((acc, [key, value]) => {
        return {...acc, [key]: value};
    }, {});

    useEffect(() => {
        dispatch(fetchAssignments({
            isNext: false,
            limit: 10,
            offset: 0,
            ...queryParameters,
        }))
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

                    </Nav>

                    <Nav>
                        <UserInfoWithRouts
                            className={"ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1"}
                            active
                        />
                    </Nav>

                </AppNavbar>

                <Container data-bs-theme={'light'}>
                    <h3 className={"m-2"}>Страница работы с нарядами</h3>
                    <hr className={'p-0 m-2'}/>

                    <SplitButton
                        as={ButtonGroup}
                        size="sm"
                        variant="secondary"
                        title="Редактировать выбранные наряды"
                        className={'mb-2'}
                        onClick={() => setOrderBy()}
                    >
                        <Dropdown.Item eventKey="1">Снять визирование</Dropdown.Item>
                        <Dropdown.Item eventKey="2">Редактировать тарификацию</Dropdown.Item>
                        <Dropdown.Item eventKey="3">Удалить</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item eventKey="4">Редактировать</Dropdown.Item>
                    </SplitButton>

                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th className={'d-flex justify-content-center'}>
                                <input className="form-check-input" type="checkbox"/>
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
                                    <input className="form-check-input" type="checkbox"/>
                                </td>
                                <td>{assignment.number}</td>
                                <td>ID Серии</td>
                                <td>{assignment.department.name}</td>
                                <td className={'bg-success'}>
                                    {assignment.status}
                                </td>
                                <td> Тариф </td>
                                <td>{`${assignment.executor?.last_name} ${assignment.executor?.first_name}`}</td>
                                <td>13.07.2022</td>
                                <th>{`${assignment.inspector?.last_name} ${assignment.inspector?.first_name}`}</th>
                            </tr>
                        ))}

                        </tbody>
                    </Table>
                </Container>

            </Container>
        </DynamicModuleLoader>
    );
};

export default AssignmentPage;