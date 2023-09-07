import {Button, Table} from "react-bootstrap";
import React, {useState} from "react";

import {classNames} from "shared/lib/classNames/classNames";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {useQueryParams} from "shared/lib/hooks/useQueryParams/useQueryParams";
import {AppModal} from "shared/ui/AppModal/AppModal";
import {Transaction, TRANSACTION_DETAILS, TRANSACTION_TYPES} from "entities/Transaction";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {EmployeePermissions, getEmployeeHasPermissions} from "entities/Employee";

import {WagesItem} from "../../model/types/types";
import {GetWagesWeekInfo} from "../../model/api/api";
import {WeekDetailElement} from "../WeekDetailElement/WeekDetailElement";
import {AddTransactionForm} from "../AddTransactionForm/AddTransactionForm";
import {ProductCounter} from "../ProductCounter/ProductCounter";

import cls from './DetailsBlock.module.scss';
import Photo from "./912316.png";

interface DetailsBlockProps {
    employee: WagesItem;
}

export const DetailsBlock = (props: DetailsBlockProps) => {
    const {
        employee,
    } = props;


    const checkPermissions = useAppSelector(getEmployeeHasPermissions);
    const addPermission = checkPermissions([EmployeePermissions.WAGES_ADD_TRANSACTION]);

    const {setQueryParam, queryParameters} = useQueryParams();
    const [showWagesModal, setShowWagesModal] = useState<
        false | {
        transaction_type: keyof typeof TRANSACTION_TYPES,
        details: keyof typeof TRANSACTION_DETAILS,
    }>(false);
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
                    <AddTransactionForm
                        employee={employee}
                        transaction_type={showWagesModal.transaction_type}
                        details={showWagesModal.details}
                    />
                </AppModal>
            }
            {transactionDetail &&
                <AppModal title={`Начисление сотруднику ${employee.first_name} ${employee.last_name}`}
                          onHide={() => setTransactionDetail(null)}
                >
                    <AddTransactionForm employee={employee} transaction={transactionDetail}
                                        deleteClb={() => setTransactionDetail(null)}/>
                </AppModal>
            }
            <div className={classNames(cls.detailHeader, {}, ['d-flex p-2 px-3 gap-2'])}>
                <img
                    src={Photo}
                    alt="Фото сотрудника"
                    style={{maxWidth: "140px", maxHeight: "140px"}}
                    className={'me-3'}
                />
                <div className={'flex-fill'}>
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

                <div style={{
                    minWidth: "250px",
                    maxWidth: "250px",
                    // overflowX: "hidden",
                    // overflowY: "auto",
                }}
                     className={'gap-1 d-flex flex-wrap'}
                >
                    {addPermission &&
                        <Button variant={'warning'}
                                style={{height: "62px", width: "120px"}}
                                onClick={() => setShowWagesModal(
                                    {transaction_type: 'cash', details: 'wages'})
                                }
                        >
                            ➕ Зарплата
                        </Button>
                    }
                    {addPermission &&
                        <Button variant={'danger'}
                                style={{height: "62px", width: "120px"}}
                                onClick={() => setShowWagesModal(
                                    {transaction_type: 'debiting', details: 'fine'})
                                }
                        >
                            ➖ Штраф
                        </Button>
                    }

                    <Button variant={'secondary'}
                            style={{height: "62px", width: "120px"}}
                            onClick={() => alert('Функция печати данных за неделю находится в разработке.')}
                    >
                        🖨️ Печать
                    </Button>


                    {addPermission &&
                        <Button
                            variant={'success'}
                            style={{height: "62px", width: "120px"}}
                            onClick={() => setShowWagesModal(
                                {transaction_type: 'accrual', details: 'wages'})
                            }
                        >
                            ➕ Начислить
                        </Button>


                    }

                </div>

            </div>

            <hr className={'m-1 mx-3 border border-2 border-black'}/>

            <div className={'d-flex p-2'} style={{height: '67vh'}}>
                <div style={{
                    minWidth: '40%',
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

                    <Table striped bordered>
                        <thead>
                        <tr>
                            <th className={'fw-bold'}>#</th>
                            {Object.entries(employee.weeks_info).map(([key, value]) => (
                                <th
                                    className={'fw-bold'}
                                    key={key}
                                >
                                    {key}{!value.confirmed && "❗"}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        <tr>
                            <td>Зар.</td>
                            {Object.entries(employee.weeks_info).map(([key, value]) => (
                                <td key={key}>
                                    {
                                        Number(value.total_accrual).toLocaleString(
                                            'ru-RU'
                                        )
                                    }
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td>Выд.</td>
                            {Object.entries(employee.weeks_info).map(([key, value]) => (
                                <td key={key}>
                                    {
                                        Number(value.total_wages).toLocaleString(
                                            'ru-RU'
                                        )
                                    }
                                </td>
                            ))}
                        </tr>
                        </tbody>
                    </Table>

                    {data ?
                        <div style={{maxWidth: '100%'}}>
                            <ProductCounter employee__id={employee.id}
                                            date_by={data.target_week_info.date_range[1]}
                                            date_from={data.target_week_info.date_range[0]}
                            />
                        </div>
                        :
                        <Skeleton width={'100%'} height={'320px'}/>
                    }


                </div>
            </div>
        </div>
    )
        ;
};