import React, {memo} from 'react';
import logo from "shared/assets/images/SZMK Logo White Horizontal 141x55.png";
import {UserInfoWithRouts} from "../../../widgets/UserInfoWithRouts";
import {Container, Table} from "react-bootstrap";
import {Slider} from "shared/ui/Slider/Slider";
import {Input} from "../../../shared/ui/Input/Input";


const TaxControlPage = memo(() => {
    const images = [
        'http://192.168.8.101:8000/media/images/products/79b280fc-739a-11ec-0a80-0da10144e03b__risunok8_ZaehDm5.png',
        'http://192.168.8.101:8000/media/images/products/c1e1f3f5-f07b-11ec-0a80-018b002c1054__vivaldi32_jNLZcOd.png'
    ]

    return (
        <>
            <section
                className={'bg-dark d-flex mb-xl-0 pb-xl-0'}
                style={{height: "7vh"}}
            >
                <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>
                <input placeholder={'Наименование изделия'} className={'h-50 w-auto form-control form-control-sm my-auto'}/>

                <UserInfoWithRouts
                    className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}/>

            </section>

            <section style={{height: "93vh", background: "#929292"}} className={'p-2'}>
                <Container className={'bg-light bg-gradient p-2 rounded h-100'}>
                    <h3>Страница назначения тарификаций</h3>
                    <hr/>

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Изображение</th>
                            <th>Наименование изделия</th>
                            <th>Отдел</th>
                            <th>Тариф</th>
                            <th>Дата назначения</th>
                            <th>Назначил</th>
                            <th>Утвердить</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <Slider images={images}/>
                            </td>

                            <td>
                                Диван (3 секции), левый/правый /1мф/ Изделие № 257 (05, 620*4340*2040)
                            </td>

                            <td>Крой</td>
                            <td>
                                <Input type={'number'} style={{width: "100px"}} defaultValue={100}/>
                            </td>
                            <td>25.04.2023</td>
                            <td>Петров П.</td>
                            <td>
                                <button type={'button'} className={'btn btn-success'}>
                                    Утвердить
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Slider images={images}/>
                            </td>

                            <td>
                                Диван (3 секции), левый/правый /1мф/ Изделие № 257 (05, 620*4340*2040)
                            </td>

                            <td>
                                Контруктора
                            </td>

                            <td>
                                <Input type={'number'} style={{width: "100px"}} defaultValue={100}/>
                            </td>
                            <td>26.04.2023</td>
                            <td>Петров П.</td>
                            <td>
                                <button type={'button'} className={'btn btn-success'}>
                                    Утвердить
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                </Container>
            </section>
        </>
    );
});

export default TaxControlPage;
