import React from "react";
import {Container, Table} from "react-bootstrap";

import cls from "./SpecificationPage.module.scss";
import {OrderProductInfo} from "./OrderProductInfo";

export const SpecificationWidget = () => {

    return (
        <div style={{minWidth: '90vw'}} className={'bg-light'}>
            <div className={cls.stickyWrapper}>
                <div className="d-flex align-items-center p-2">
                    <h4 className={'m-0'}>
                        Виджет детализации спецификации
                        {/*{assignmentProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}*/}
                    </h4>
                </div>
                <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
            </div>

            <Container data-bs-theme={'light'} fluid>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>#</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Номер заказа</td>
                        <td>23456</td>
                    </tr>

                    <tr>
                        <td>Вх. заказ (№)</td>
                        <td>с-1364</td>
                    </tr>

                    <tr>
                        <td>Проект</td>
                        <td>COMO</td>
                    </tr>

                    <tr>
                        <td>Комментарий общий каркас:</td>
                        <td>
                            Делаем качественно, дополнительно прострелять скобами
                        </td>
                    </tr>
                    <tr>
                        <td>Комментарий общий чехол:</td>
                        <td>
                            Шов в подгибку с закрытым срезом!
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div className={'d-flex w-100'}>
                                <div className={'bg-success'} style={{height: '10px', width: '53%'}}></div>
                                <div className={'bg-danger'} style={{height: '10px', width: '12%'}}></div>
                                <div className={'bg-secondary'} style={{height: '10px', width: '35%'}}></div>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </Table>

                <OrderProductInfo number={1}/>
                <OrderProductInfo number={2}/>
                <OrderProductInfo number={3}/>
            </Container>

        </div>
    );
};
