import React, {memo} from 'react';
import logo from "shared/assets/images/SZMK Logo White Horizontal 900х352.png";
import {Container} from "react-bootstrap";
import {UserInfoWithRouts} from "../../../widgets/UserInfoWithRouts";


const ForbiddenPage = memo(() => {

    return (
        <div>
            <section
                className={'bg-dark d-flex mb-xl-0 pb-xl-0'}
                style={{height: "7vh"}}
            >
                <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>

                <UserInfoWithRouts
                    className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}
                />
            </section>

            <Container>
                <div className={'mt-5 d-flex flex-column justify-content-center align-items-center'}>
                    <h1 className={'mt-5'}>
                        Доступ в сервис ограничен
                        <i className="fas fa-exclamation-triangle mx-xl-3"/>
                    </h1>
                    <h6>
                        Для получения доступа обратитесь к администратору системы.
                    </h6>
                </div>

            </Container>
        </div>
    );
});

export default ForbiddenPage;