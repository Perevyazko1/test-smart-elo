import React from "react";

import {classNames} from "shared/lib/classNames/classNames";

import {Button, Container, Nav, Table} from "react-bootstrap";
import {UpdatePageBtn} from "../../../../widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "../../../../widgets/UserInfoWithRouts";
import {AppNavbar} from "../../../../shared/ui/AppNavbar/AppNavbar";

import cls from './TaxControlPageNew.module.scss';
import {TaxControlElement} from "../TaxControlElement/TaxControlElement";

const TaxControlPageNew = () => {


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

            <Container fluid className={'pt-3'} data-bs-theme={'light'}>
                <div className={classNames(cls.stickyWrapper, {}, ['bg-light'])}>
                    <div className="d-flex align-items-center">
                        <h3>
                            Новая страница контроля тарификаций
                        </h3>
                    </div>
                    <hr className={'p-0 m-1 mb-2 w-25'}/>
                </div>


                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th>
                            #
                        </th>
                        <th>Наименование изделия</th>
                        <th>Отдел</th>
                        <th>#</th>
                        <th>
                            Тариф
                        </th>
                        <th>
                            Дата
                        </th>
                        <th>
                            ФИО
                        </th>
                        <th>
                            #
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                        <TaxControlElement color={'rgba(121,223,193,0.5)'} department={'Конструктора'}/>
                        <TaxControlElement color={'rgba(121,157,223,0.5)'} department={'Крой'}/>
                        <TaxControlElement color={'rgba(198,223,121,0.5)'} department={'Столярка'}/>


                    </tbody>
                </Table>

            </Container>
        </Container>
    );
};

export default TaxControlPageNew;