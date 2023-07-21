import React, {memo} from 'react';
import {Container} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";


const ForbiddenPage = memo(() => {

    return (
        <Container fluid style={{height: "100vh", margin: '0', padding: '0'}}>
            <AppNavbar>
                <UserInfoWithRouts
                    className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}
                />
            </AppNavbar>

            <Container>
                <div className={'mt-5 d-flex flex-column justify-content-center align-items-center'}>
                    <h1 className={'mt-5 mb-3 text-center'}>
                        Страница не найдена либо к ней нет доступа. Попробуйте обновить страницу.
                        <i className="fas fa-exclamation-triangle mx-xl-3"/>
                    </h1>
                    <h6>
                        Для получения доступа обратитесь к администратору системы.
                    </h6>
                </div>
            </Container>
        </Container>
    );
});

export default ForbiddenPage;