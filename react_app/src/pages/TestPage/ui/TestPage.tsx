import React, {memo} from 'react';
import {Button, Container} from "react-bootstrap";

import logo from "shared/assets/images/SZMK Logo White Horizontal 900х352.png";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {notificationsActions} from "widgets/Notification";


const TestPage = memo(() => {

    const dispatch = useAppDispatch()

    const buttonOnclick = () => {
        dispatch(notificationsActions.addNotification({
            title: 'Уведомление',
            body: "Проверка входящего уведомления",
            type: "ошибка",
            date: Date.now(),
        }))
    }

    return (
        <>
            <section
                className={'bg-dark d-flex mb-xl-0 pb-xl-0'}
                style={{height: "7vh"}}

            >
                <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>

                <UserInfoWithRouts
                    className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}
                />
            </section>

            <Container className={'bg-light rounded d-flex justify-content-center p-5'} style={{height: "93vh"}}>
                <h3>Страница разработки</h3>
                <hr/>

                <Button onClick={buttonOnclick}>
                    Новое уведомление
                </Button>


            </Container>
        </>
    );
});

export default TestPage;