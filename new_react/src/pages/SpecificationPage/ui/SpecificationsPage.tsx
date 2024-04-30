import React, {useState} from "react";

import cls from "./SpecificationPage.module.scss";

import {ModalProvider} from "@app";
import {AppNavbar} from "@widgets/AppNavbar";

import {SpecificationsCard} from "./SpecificationsCard";
import {Container, Table} from "react-bootstrap";

export const SpecificationsPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <ModalProvider>
            <div className={cls.pageContainer}>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                    Номер заказа, проект, статус
                </AppNavbar>

                <div className={cls.stickyWrapper}>
                    <div className="d-flex align-items-center p-2">
                        <h4 className={'m-0'}>
                            Страница спецификаций заказов
                            {/*{assignmentProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}*/}
                        </h4>
                    </div>
                    <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
                </div>

                <Container data-bs-theme={'light'}>
                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Вх. заказ (№)</th>
                            <th>Срочность</th>
                            <th>Проект</th>
                            <th>Статус</th>
                            <th>План дата отгрузки</th>
                        </tr>
                        </thead>
                        <tbody>

                        <SpecificationsCard/>

                        </tbody>
                    </Table>

                </Container>
            </div>
        </ModalProvider>
    );
};
