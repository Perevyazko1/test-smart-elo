import React, {useState} from "react";
import {Button, Container, Nav, Table} from "react-bootstrap";

import {classNames} from "shared/lib/classNames/classNames";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";

import cls from './WagesPage.module.scss';
import Photo from './ImagePhoto.jpg';

const WagesPage = () => {

    const [showDetails, setShowDetails] = useState(false);

    return (
        <Container className={classNames(cls.pageContainer, {}, [])}
                   fluid
                   data-bs-theme={'dark'}
        >
            <AppNavbar>
                <Nav className="me-auto">
                    <UpdatePageBtn
                        style={{height: '39px'}}
                        className={'my-auto ms-2 border border-light border-1 rounded px-1 bg-body-tertiary px-3'}
                    />
                </Nav>

                <Nav>
                    <UserInfoWithRouts
                        className={"ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1"}
                        active
                    />
                </Nav>

            </AppNavbar>

            <Container fluid className={'d-flex justify-content-start'}>
                <Container
                    data-bs-theme={'light'}
                    fluid
                    className={'mt-2 p-0 d-flex justify-content-start'}
                >

                    <div>
                        <Table striped bordered hover size="sm"
                               style={{width: showDetails ? "300px" : "100%"}}>
                            <thead>
                            <tr>
                                <th
                                    className={'fw-bold'}
                                    style={{width: '300px', height: '66px'}}
                                    rowSpan={2}
                                >
                                    ФИО Сотрудника
                                </th>

                                {!showDetails &&
                                    <>
                                        <th className={'fw-bold'}>Отдел</th>
                                        <th className={'fw-bold'}>Баланс
                                        </th>
                                        <th className={'fw-bold'}>Неделя 28✅</th>
                                        <th className={'fw-bold'}>Неделя 29✅</th>
                                        <th className={'fw-bold'}>Неделя 30✅</th>
                                        <th className={'fw-bold'}>Неделя 31✅</th>
                                        <th className={'fw-bold'}>Неделя 32✅</th>
                                        <th className={'fw-bold'}>Неделя 33</th>
                                    </>
                                }
                            </tr>

                            <tr className={cls.borderBottom}>
                                {!showDetails &&
                                    <>
                                        <th className={'fw-bold'}>
                                            Итого:
                                        </th>
                                        <th className={'fw-bold text-end'}>1 754 323</th>
                                        <th className={'fw-bold text-end'}>600 000</th>
                                        <th className={'fw-bold text-end'}>700 000</th>
                                        <th className={'fw-bold text-end'}>890 000</th>
                                        <th className={'fw-bold text-end'}>460 000</th>
                                        <th className={'fw-bold text-end'}>580 000</th>
                                        <th className={'fw-bold text-end'}>690 000</th>
                                    </>
                                }
                            </tr>
                            </thead>

                            <tbody>
                            <tr>
                                <td onClick={() => setShowDetails(!showDetails)}
                                    style={{height: '45px', width: '300px'}}>
                                    Гуков Олег Владимирович
                                </td>
                                {!showDetails &&
                                    <>
                                        <td style={{backgroundColor: "#7FFF82"}}>
                                            Сборка
                                        </td>
                                        <td>32 866</td>
                                        <td>35 000</td>
                                        <td>36 100</td>
                                        <td>37 221</td>
                                        <td>32 000</td>
                                        <td>31 000</td>
                                        <td>31 000</td>
                                    </>
                                }
                            </tr>
                            <tr>
                                <td onClick={() => setShowDetails(!showDetails)}
                                    style={{height: '45px', width: '300px'}}>
                                    Харченко Дмитрий Владимирович
                                </td>
                                {!showDetails &&
                                    <>
                                        <td>
                                            Администрация
                                        </td>
                                        <td>32 866</td>
                                        <td>35 000</td>
                                        <td>36 100</td>
                                        <td>37 221</td>
                                        <td>32 000</td>
                                        <td>31 000</td>
                                        <td>31 000</td>
                                    </>
                                }
                            </tr>
                            <tr>
                                <td onClick={() => setShowDetails(!showDetails)}
                                    style={{height: '45px', width: '300px'}}>
                                    Борисенко Артем Александрович
                                </td>
                                {!showDetails &&
                                    <>
                                        <td>
                                            Администрация
                                        </td>
                                        <td>32 866</td>
                                        <td>35 000</td>
                                        <td>36 100</td>
                                        <td>37 221</td>
                                        <td>32 000</td>
                                        <td>31 000</td>
                                        <td>31 000</td>
                                    </>
                                }
                            </tr>
                            <tr>
                                <td onClick={() => setShowDetails(!showDetails)}
                                    style={{height: '45px', width: '300px'}}>
                                    Голубев Валерий
                                </td>
                                {!showDetails &&
                                    <>
                                        <td style={{backgroundColor: "#a0e3a0"}}>
                                            Обивка
                                        </td>
                                        <td>32 866</td>
                                        <td>35 000</td>
                                        <td>36 100</td>
                                        <td>37 221</td>
                                        <td>32 000</td>
                                        <td>31 000</td>
                                        <td>31 000</td>
                                    </>
                                }
                            </tr>
                            </tbody>
                        </Table>
                    </div>

                    {showDetails &&
                        <div style={{width: '100%', height: '90vh'}} className={'border border-2 border-black'}>
                            <div className={'d-flex p-3'} style={{height: '20vh'}}>
                                <img
                                    src={Photo}
                                    alt="Фото сотрудника"
                                    style={{maxWidth: "140px", maxHeight: "140px"}}
                                    className={'me-3'}
                                />
                                <div>
                                    <h4 className={'fw-bold'}>Борисенко Артем Александрович</h4>
                                    <p>09.02.1995 г.р. Отдел: Администрация</p>
                                    <div className={'gap-2 d-flex'}>
                                        <Button size={"sm"}>Обивка</Button>
                                        <Button size={"sm"}>Крой</Button>
                                        <Button size={"sm"}>Пошив</Button>
                                        <Button size={"sm"}>Администрация</Button>
                                    </div>
                                </div>

                            </div>
                            <hr className={'m-1 mx-3 border border-2 border-black'}/>

                            <div className={'d-flex p-2'} style={{height: '67vh'}}>
                                <div style={{
                                    width: '30%',
                                    height: '66vh',
                                    overflowX: 'hidden',
                                    overflowY: 'auto',
                                }}
                                     className={'border border-2 border-black p-1'}
                                >
                                    <h6>Начисления</h6>
                                    <hr className={'m-1'}/>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7 bg-danger'}>23.08.23  ➖ 5 000 - штраф пришел пьяный</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                    <p className={'fs-7'}>23.08.23 ➕ 300 - готовность полуфабриката</p>
                                </div>

                                <div className={"px-2"}>
                                    <h4>Состояние расчета (баланс): +20 000 </h4>

                                    <Table>
                                        <thead>
                                        <tr>
                                            <th className={'fw-bold'}>#</th>
                                            <th className={'fw-bold'}>Неделя 28</th>
                                            <th className={'fw-bold'}>Неделя 28</th>
                                            <th className={'fw-bold'}>Неделя 28</th>
                                            <th className={'fw-bold'}>Неделя 28</th>
                                            <th className={'fw-bold'}>Неделя 28</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        <tr>
                                            <td>Заработано</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                        </tr>
                                        <tr>
                                            <td>Выдано</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                            <td>35 000</td>
                                        </tr>
                                        </tbody>
                                    </Table>


                                    <div>
                                        <div className={'d-flex gap-3 p-2 mt-5'}>
                                            <Button variant={'danger'}>
                                                ➖ Добавить штраф
                                            </Button>

                                            <Button variant={'secondary'}>
                                                🖨️ Печать
                                            </Button>

                                        </div>

                                        <div className={'d-flex gap-3 p-2'}>
                                            <Button variant={'success'}>
                                                ➕ Добавить начисление
                                            </Button>

                                            <Button variant={'warning'}>
                                                ➕ Выдать ЗП
                                            </Button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                </Container>
            </Container>
        </Container>
    )
        ;
};

export default WagesPage;