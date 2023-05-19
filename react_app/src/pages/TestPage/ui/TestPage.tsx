import React, {memo} from 'react';
import {Container} from "react-bootstrap";

import logo from "shared/assets/images/SZMK Logo White Horizontal 900х352.png";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {TechProcessWidget} from "widgets/TechProcessWidget";


const TestPage = memo(() => {

    const schema = {
        "ППУ": ["Обивка"],
        "Крой": ["Пошив"],
        "Пила": ["Лазер"],
        "Лазер": ["Сборка"],
        "Пошив": ["Обивка"],
        "Старт": ["Пила", "Крой", "ППУ", "Подрядчики"],
        "Обивка": ["Упаковка"],
        "Сборка": ["Обивка"],
        "Малярка": ["Обивка"],
        "Столярка": ["Малярка"],
        "Упаковка": ["Готово"],
        "Подрядчики": ["Столярка"]
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
            <Container className={'bg-light rounded'} style={{height: "93vh"}}>
                <h3>Страница разработки</h3>
                <hr/>

                <TechProcessWidget
                    // disabled={true}
                    schema={schema}
                    onSubmitData={(data) => console.log(data)}
                />


            </Container>
        </>
    );
});

export default TestPage;