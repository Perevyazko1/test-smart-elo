import React from "react";
import {ButtonGroup, Container, Dropdown, Nav, SplitButton, Table} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";

import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {classNames} from "shared/lib/classNames/classNames";

import cls from './AssignmentPage.module.scss';

const AssignmentPage = () => {

    return (
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
                    <tr>
                        <td className={'d-flex justify-content-center'}>
                            <input className="form-check-input" type="checkbox"/>
                        </td>
                        <td>1</td>
                        <td>[1]23123</td>
                        <td>Конструктора</td>
                        <td className={'bg-success'}>Выполнен</td>
                        <td>1200</td>
                        <td>Харьков И.</td>
                        <td>13.07.2022</td>
                        <th>Харченко Д.</th>
                    </tr>

                    <tr>
                        <td className={'d-flex justify-content-center'}>
                            <input className="form-check-input" type="checkbox"/>
                        </td>
                        <td>2</td>
                        <td>[1]23123</td>
                        <td>Конструктора</td>
                        <td className={'bg-success'}>Выполнен</td>
                        <td>1200</td>
                        <td>Харьков И.</td>
                        <td>13.07.2022</td>
                        <th>Харченко Д.</th>
                    </tr>

                    <tr>
                        <td className={'d-flex justify-content-center'}>
                            <input className="form-check-input" type="checkbox"/>
                        </td>
                        <td>3</td>
                        <td>[1]23123</td>
                        <td>Конструктора</td>
                        <td className={'bg-success'}>Выполнен</td>
                        <td>1200</td>
                        <td>Харьков И.</td>
                        <td>13.07.2022</td>
                        <th>Харченко Д.</th>
                    </tr>

                    <tr>
                        <td className={'d-flex justify-content-center'}>
                            <input className="form-check-input" type="checkbox"/>
                        </td>
                        <td>4</td>
                        <td>[1]23123</td>
                        <td>Конструктора</td>
                        <td className={'bg-success'}>Выполнен</td>
                        <td>1200</td>
                        <td>Харьков И.</td>
                        <td>13.07.2022</td>
                        <th>Харченко Д.</th>
                    </tr>

                    </tbody>
                </Table>
            </Container>

        </Container>
    );
};

export default AssignmentPage;