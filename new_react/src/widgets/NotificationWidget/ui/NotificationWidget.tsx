import React, {useEffect, useState} from "react";
import {Button, Container, Spinner, Table} from "react-bootstrap";

import {useNavigate} from "react-router-dom";

import {$axiosAPI} from "@shared/api"
import {AppSkeleton} from "@shared/ui";


interface NotificationType {
    await_visa?: number;
    await_tech_process?: number;
    await_tariff?: number;
    await_tariff_visa?: number;
    await_tasks_visa?: number;
}


export const NotificationWidget = (props: { closeClb: () => void }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<NotificationType>({});
    const navigate = useNavigate();

    const getData = async () => {
        const response = await $axiosAPI.get<NotificationType>('staff/tasks/get_tasks_count/')
        if (response.status === 200) {
            setData(response.data)
        }
    }

    useEffect(() => {
        setIsLoading(true);
        getData().then(() => setIsLoading(false));
    }, [])

    const awaitVisaClb = () => {
        navigate("/eq?view_mode=boss");
        props.closeClb();
    }

    const awaitTariffClb = () => {
        navigate("/eq?view_mode=boss");
        props.closeClb();
    }

    const awaitTariffVisaClb = () => {
        navigate("/tariffication/?tariff_status=proposed");
        props.closeClb();
    }

    const awaitTasksVisaClb = () => {
        navigate("/task?view_mode=7&sort_mode=1");
        props.closeClb();
    }

    const awaitTechProcessClb = () => {
        navigate("/?view_mode=boss");
        props.closeClb();
    }

    return (
        <div>
            <div className="d-flex align-items-center">
                <h5 className={'m-0'}>
                    Уведомления
                    {isLoading && <Spinner animation={'grow'} size={'sm'}/>}
                </h5>
            </div>
            <hr className={'m-1 p-0'}/>

            <Container fluid>

                <Table bordered hover striped data-bs-theme={'light'} size={'sm'} style={{minWidth: '80vw'}}>
                    <thead>
                    <tr>
                        <th>
                            Название
                        </th>
                        <th>
                            Количество
                        </th>
                        <th>
                            Ссылка
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {isLoading ?
                        <>
                            <tr>
                                <td colSpan={3}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={3}><AppSkeleton/></td>
                            </tr>
                            <tr>
                                <td colSpan={3}><AppSkeleton/></td>
                            </tr>
                        </>
                        :
                        <>

                            {data.await_visa &&
                                <tr>
                                    <td>
                                        ЭЛО: Проставить визу на нарядах
                                    </td>
                                    <td>
                                        <b>{data.await_visa}</b>
                                    </td>
                                    <td>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            onClick={awaitVisaClb}
                                        >
                                            Перейти
                                        </Button>
                                    </td>
                                </tr>
                            }

                            {data.await_tariff &&
                                <tr>
                                    <td>
                                        ЭЛО: Проставить сделку
                                    </td>
                                    <td>
                                        <b>{data.await_tariff}</b>
                                    </td>
                                    <td>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            onClick={awaitTariffClb}
                                        >
                                            Перейти
                                        </Button>
                                    </td>
                                </tr>
                            }

                            {data.await_tariff_visa &&
                                <tr>
                                    <td>
                                        ЭЛО: Утвердить предложенную сделку
                                    </td>
                                    <td>
                                        <b>{data.await_tariff_visa}</b>
                                    </td>
                                    <td>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            onClick={awaitTariffVisaClb}
                                        >
                                            Перейти
                                        </Button>
                                    </td>
                                </tr>
                            }

                            {data.await_tasks_visa &&
                                <tr>
                                    <td>
                                        ЗАДАЧНИК: Утвердить предложенную сделку
                                    </td>
                                    <td>
                                        <b>{data.await_tasks_visa}</b>
                                    </td>
                                    <td>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            onClick={awaitTasksVisaClb}
                                        >
                                            Перейти
                                        </Button>
                                    </td>
                                </tr>
                            }

                            {data.await_tech_process &&
                                <tr>
                                    <td>
                                        КОНСТРУКТОРСКИЙ: Установить техпроцесс
                                    </td>

                                    <td>
                                        <b>{data.await_tech_process}</b>
                                    </td>

                                    <td>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            onClick={awaitTechProcessClb}
                                        >
                                            Перейти
                                        </Button>
                                    </td>
                                </tr>
                            }
                        </>
                    }
                    </tbody>

                </Table>
            </Container>

        </div>
    );
};
