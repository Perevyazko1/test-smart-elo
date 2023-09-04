import {Button, Table} from "react-bootstrap";
import React, {useState} from "react";

import {classNames} from "shared/lib/classNames/classNames";

import cls from './DetailsBlock.module.scss';
import Photo from "./912316.png";
import {WagesItem} from "../../model/types/types";
import {GetWagesWeekInfo} from "../../model/api/api";
import {WeekDetailElement} from "../WeekDetailElement/WeekDetailElement";
import {Skeleton} from "../../../../shared/ui/Skeleton/Skeleton";
import {useQueryParams} from "../../../../shared/lib/hooks/useQueryParams/useQueryParams";
import {AppModal} from "../../../../shared/ui/AppModal/AppModal";
import {AddTransactionForm} from "../AddTransactionForm/AddTransactionForm";
import {Transaction} from "../../../../entities/Transaction";

interface DetailsBlockProps {
    employee: WagesItem;
}

export const DetailsBlock = (props: DetailsBlockProps) => {
    const {
        employee,
    } = props;

    const {setQueryParam, queryParameters} = useQueryParams();
    const [showWagesModal, setShowWagesModal] = useState<boolean>(false);
    const [transactionDetail, setTransactionDetail] = useState<Transaction | null>(null);

    const {data} = GetWagesWeekInfo({
        employee__id: employee.id,
        ...queryParameters,
    })

    const getStrWeek = () => {
        if (data) {
            const weekInfo = data?.target_week_info;
            return (
                `Неделя ${weekInfo.week} с ${weekInfo.str_dates[0]} по ${weekInfo.str_dates[6]}`
            )
        } else {
            return <Skeleton width={'100%'} height={'15px'}/>
        }
    }

    return (

        <div className={
            classNames(cls.detailsBlock, {}, ['border border-2 border-black'])
        }>
            {showWagesModal &&
                <AppModal title={`Создание начисления сотруднику ${employee.first_name} ${employee.last_name}`}
                          onHide={() => setShowWagesModal(false)}
                >
                    <AddTransactionForm employee={employee}/>
                </AppModal>
            }
            {transactionDetail &&
                <AppModal title={`Начисление сотруднику ${employee.first_name} ${employee.last_name}`}
                          onHide={() => setTransactionDetail(null)}
                >
                    <AddTransactionForm employee={employee} transaction={transactionDetail}/>
                </AppModal>
            }
            <div className={classNames(cls.detailHeader, {}, ['d-flex p-3'])}>
                <img
                    src={Photo}
                    alt="Фото сотрудника"
                    style={{maxWidth: "140px", maxHeight: "140px"}}
                    className={'me-3'}
                />
                <div>
                    <h4 className={'fw-bold'}>{employee.first_name} {employee.last_name}</h4>
                    <p>{employee.description || 'У сотрудника нет описания'}</p>
                    <div className={'gap-2 d-flex flex-wrap'}>
                        {employee.departments?.map((department) => (
                            <Button
                                size={"sm"}
                                key={department.id}
                                style={{backgroundColor: department.color}}
                                variant={'outline-dark'}
                            >
                                {department.name}
                            </Button>
                        ))}
                    </div>
                </div>

            </div>
            <hr className={'m-1 mx-3 border border-2 border-black'}/>

            <div className={'d-flex p-2'} style={{height: '67vh'}}>
                <div style={{
                    width: '40%',
                    height: '66vh',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                }}
                     className={'border border-2 border-black p-1'}
                >
                    <div className={'d-flex justify-content-between'}>
                        <Button
                            size={'sm'}
                            className={'px-1'}
                            onClick={() => {
                                setQueryParam(
                                    'week',
                                    String(data?.target_week_info?.previous_week_data?.week) || ""
                                )
                                setQueryParam(
                                    'year',
                                    String(data?.target_week_info?.previous_week_data?.year) || ""
                                )
                            }}
                        >
                            <i className="far fa-arrow-alt-circle-left mx-xl-3"/>
                        </Button>

                        {getStrWeek()}
                        <Button
                            size={'sm'}
                            className={'px-1'}
                            onClick={() => {
                                setQueryParam(
                                    'week',
                                    String(data?.target_week_info?.next_week_data?.week) || ""
                                )
                                setQueryParam(
                                    'year',
                                    String(data?.target_week_info?.next_week_data?.year) || ""
                                )
                            }}
                        >
                            <i className="far fa-arrow-alt-circle-right mx-xl-3"/>
                        </Button>
                    </div>
                    <hr className={'m-1'}/>


                    <Table bordered size="sm">
                        <tbody>
                        {data && Object.entries(data.earned_per_week).map(([key, earnedData], index) => (
                            <WeekDetailElement
                                key={key}
                                weekName={key}
                                index={index}
                                data={earnedData}
                                weekInfo={data.target_week_info}
                                employeeId={employee.id}
                                onClick={(transaction) => setTransactionDetail(transaction)}
                            />
                        ))}
                        </tbody>
                    </Table>

                </div>

                <div className={"px-2"}>
                    <h4>Состояние расчета (баланс): {employee.current_balance > 0 ? "➕" :
                        employee.current_balance < 0 ? "➖" : ""
                    }
                        {Number(employee.current_balance).toLocaleString("ru-RU")}</h4>

                    <Table>
                        <thead>
                        <tr>
                            <th className={'fw-bold'}>#</th>
                            {Object.entries(employee.weeks_info).map(([key, value]) => (
                                <th
                                    className={'fw-bold'}
                                    key={key}
                                >
                                    {key} {value.confirmed && value.total && "✅"}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td>Заработано</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>Выдано</td>
                            {Object.entries(employee.weeks_info).map(([key, value]) => (
                                <td key={key}>
                                    {
                                        Number(value.total).toLocaleString(
                                            'ru-RU'
                                        )
                                    }
                                    {value.confirmed && value.total && "✅"}
                                </td>
                            ))}
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
                            <Button
                                variant={'success'}
                                onClick={() => setShowWagesModal(true)}
                            >
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
    );
};