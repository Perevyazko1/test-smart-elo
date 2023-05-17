import React, {memo} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import logo from "shared/assets/images/SZMK Logo White Horizontal 900х352.png";
import {Container} from "react-bootstrap";
import {UserInfoWithRouts} from "../../../widgets/UserInfoWithRouts";
import {TechProcessWidget} from "../../../widgets/TechProcessWidget/TechProcessWidget/TechProcessWidget";

interface TestPageProps {
    className?: string
}


const TestPage = memo((props: TestPageProps) => {
    const {
        className,
        ...otherProps
    } = props

    const departments: string[] = [
        'Старт',
        'Пила',
        'Лазер',
        'Сборка',
        'Крой',
        'Пошив',
        'Столярка',
        'Малярка',
        'Подрядчики',
        'ППУ',
        'Обивка',
        'Упаковка',
        'Готово',
    ]

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

    const mods: Mods = {};

    return (
        <>
            <section
                className={classNames('bg-dark d-flex mb-xl-0 pb-xl-0', mods, [className])}
                style={{height: "7vh"}}
                {...otherProps}

            >
                <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>

                <UserInfoWithRouts
                    className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}
                />
            </section>
            <Container className={'bg-light rounded'} style={{height: "93vh"}}>
                <h3>Страница разработки</h3>
                <hr/>

                <TechProcessWidget departments={departments} schema={schema}/>


            </Container>
        </>
    );
});

export default TestPage;