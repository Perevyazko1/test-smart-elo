import {Button, Col, Container, Row, Table} from "react-bootstrap";

import cls from './WagesDetails.module.scss';
import Photo from "./912316.png";

import {Transaction, TRANSACTION_DETAILS, TRANSACTION_TYPES} from "@entities/Transaction";
import {useAppModal, useAppQuery, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {AppSkeleton} from "@shared/ui";

import {WagesItem} from "../../model/types/types";
import {GetWagesWeekInfo} from "../../model/api/api";

import {ProductCounter} from '../ProductCounter/ProductCounter';
import {WagesWeek} from "../WagesWeek/WagesWeek";
import {AddTransactionForm} from "../AddTransactionForm/AddTransactionForm";

interface WagesDetailsProps {
    employee: WagesItem;
}


export const WagesDetails = (props: WagesDetailsProps) => {
    const {employee} = props;

    const addPermission = usePermission(APP_PERM.WAGES_ADD_TRANSACTION);
    const {queryParameters, setQueryParam} = useAppQuery();
    const {handleOpen, handleClose} = useAppModal();

    const {data} = GetWagesWeekInfo({
        employee__id: employee.id,
        ...queryParameters,
    });

    const getStrWeek = () => {
        if (data) {
            const weekInfo = data?.target_week_info;
            return (
                `Неделя ${weekInfo.week} с ${weekInfo.str_dates[0]} по ${weekInfo.str_dates[6]}`
            )
        } else {
            return <AppSkeleton style={{width: '100%', height: '15px'}}/>
        }
    }

    const showWagesModalClb = (props: {
        transaction_type: keyof typeof TRANSACTION_TYPES,
        details: keyof typeof TRANSACTION_DETAILS,
    }) => {
        handleOpen(
            <AddTransactionForm
                title={`Создание начисления сотруднику ${employee.first_name} ${employee.last_name}`}
                employee={employee}
                transaction_type={props.transaction_type}
                details={props.details}
            />
        )
    }

    const showTransactionClb = (transaction: Transaction) => {
        handleOpen(
            <AddTransactionForm
                title={`Создание начисления сотруднику ${employee.first_name} ${employee.last_name}`}
                employee={employee}
                transaction={transaction}
                deleteClb={handleClose}
            />
        )
    }

    return (
        <div className={cls.detailsBlock + ' border border-2 border-black'}>
            <Container fluid className={'w-100 h-100'}>
                <Row className={cls.headerBlock}>
                    <Col xs={12} className={'d-flex gap-2 p-2 h-100'}>
                        <img
                            src={Photo}
                            alt="Фото сотрудника"
                            style={{maxHeight: "100%"}}
                        />

                        <div className={'flex-fill'}>
                            <h4 className={'fw-bold'}>{employee.first_name} {employee.last_name}</h4>
                            <p>{employee.description || 'У сотрудника нет описания'}</p>
                            <div className={'gap-2 d-flex flex-wrap'}>
                                {employee.departments?.map((department) => (
                                    <button
                                        key={department.id}
                                        className={'appBtn fs-7 p-1'}
                                        style={{backgroundColor: department.color}}
                                        onClick={() => setQueryParam(
                                            'department__name',
                                            department.name || ""
                                        )}
                                    >
                                        {department.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            minWidth: "270px",
                            maxWidth: "270px",
                        }}
                             className={'gap-1 d-flex flex-wrap'}
                        >
                            {addPermission &&
                                <button
                                    className={'appBtn p-1 yellowBtn text-black'}
                                    style={{width: "130px"}}
                                        onClick={() => showWagesModalClb(
                                            {transaction_type: 'cash', details: 'wages'}
                                        )}
                                >
                                    ➕ Выдача
                                </button>
                            }
                            {addPermission &&
                                <button
                                    className={'appBtn p-1 redBtn text-black'}
                                    style={{width: "130px"}}
                                        onClick={() => showWagesModalClb({
                                            transaction_type: 'debiting',
                                            details: 'fine'
                                        })}
                                >
                                    ➖ Штраф
                                </button>
                            }

                            <button
                                    className={'appBtn p-1 greyBtn text-black'}
                                    style={{width: "130px"}}
                                    onClick={() => alert('Функция печати данных за неделю находится в разработке.')}
                                    disabled
                            >
                                🖨️ Печать
                            </button>


                            {addPermission &&
                                <button
                                    className={'appBtn p-1 greenBtn text-black'}
                                    style={{width: "130px"}}
                                    onClick={() => showWagesModalClb(
                                        {transaction_type: 'accrual', details: 'wages'}
                                    )}
                                >
                                    ➕ Начисление
                                </button>
                            }
                        </div>
                    </Col>
                </Row>


                <Row className={cls.bodyBlock}>
                    <Col xs={4} className={cls.weekInfoBlock + ' p-2'}>

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
                        <hr className={'m-2'}/>

                        <Table bordered size="sm">
                            <tbody>
                            {data && Object.entries(data.earned_per_week).map(([key, earnedData], index) => (
                                <WagesWeek
                                    key={key}
                                    weekName={key}
                                    index={index}
                                    data={earnedData}
                                    weekInfo={data.target_week_info}
                                    employeeId={employee.id}
                                    onClick={showTransactionClb}
                                />
                            ))}
                            </tbody>
                        </Table>

                    </Col>

                    <Col className={'h-100'}>
                        <Row className={cls.sumBlock + ' p-2'}>
                            <h4>Состояние расчета (баланс): {employee.current_balance > 0 ? "➕" :
                                employee.current_balance < 0 ? "➖" : ""
                            }
                                {Number(employee.current_balance).toLocaleString("ru-RU")}</h4>

                            <Table striped bordered style={{maxHeight: '30%'}}>
                                <thead>
                                <tr>
                                    <th className={'fw-bold'}>#</th>
                                    {Object.entries(employee.weeks_info).map(([key, value]) => (
                                        <th
                                            className={'fw-bold'}
                                            key={key}
                                            onClick={() => {
                                                setQueryParam(
                                                    'week',
                                                    String(value.week) || ""
                                                )
                                                setQueryParam(
                                                    'year',
                                                    String(value.year) || ""
                                                )
                                            }}
                                            style={{cursor: "pointer"}}
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
                        </Row>

                        <Row className={cls.countProductBlock + ' p-1'}>
                            {data ?
                                <ProductCounter employee__id={employee.id}
                                                date_by={data.target_week_info.date_range[1]}
                                                date_from={data.target_week_info.date_range[0]}
                                />
                                :
                                <AppSkeleton style={{width: "100%", height: "320px"}}/>
                            }
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
