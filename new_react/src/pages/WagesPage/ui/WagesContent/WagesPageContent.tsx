import {useEffect, useState} from "react";
import {Container, Table} from "react-bootstrap";

import cls from '../WagesPage.module.scss';

import {AppInput, AppSkeleton} from "@shared/ui";
import {useAppQuery, useDebounce} from "@shared/hooks";

import {GetWagesList} from "../../model/api/api";
import {WagesItem} from "../../model/types/types";
import {WagesDetails} from "../WagesDetails/WagesDetails";

export const WagesPageContent = () => {
    const {setQueryParam, queryParameters} = useAppQuery();

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );

    const [nameInputValue, setNameInputValue] = useState<string>(queryParameters.input_name || '');

    useEffect(() => {
        debouncedSetQueryParam('input_name', nameInputValue)
        // eslint-disable-next-line
    }, [nameInputValue]);

    const {data} = GetWagesList({
        ...queryParameters
    });

    const [selectedEmployee, setSelectedEmployee] = useState<WagesItem | null>(null);

    // При изменении data меняем состояние выбранного сотрудника
    useEffect(() => {
        if (data && selectedEmployee) {
            setSelectedEmployee(data.detailed_data.find(obj => obj.id === selectedEmployee.id) || null)
        }
        // eslint-disable-next-line
    }, [data]);

    // В случае если поиском попадаем в одного сотрудника - сразу его выбираем
    useEffect(() => {
        if (data && data.detailed_data.length === 1) {
            setSelectedEmployee(data.detailed_data[0])
        }
    }, [data]);


    return (
        <Container fluid className={cls.pageContent}>
            <div
                data-bs-theme={'light'}
                className={'mt-2 p-0 d-flex w-100'}
            >
                <div className={cls.employeeList + ' flex-fill'}>
                    <Table striped bordered hover size="sm"
                           style={{
                               width: selectedEmployee ? "300px" : "100%",
                           }}
                           className={cls.tableData}
                    >

                        <thead>
                        <tr>
                            <th
                                style={{width: '300px', height: '66px'}}
                                rowSpan={2}
                            >
                                <div
                                    className={
                                        'fs-5 d-flex fw-bold justify-content-evenly align-items-center w-100 h-100'
                                    }>
                                    ФИО
                                    <AppInput
                                        style={{width: '220px'}}
                                        placeholder="ФИО"
                                        value={nameInputValue}
                                        onChange={(event) => setNameInputValue(event.target.value)}
                                    />
                                </div>
                            </th>

                            {!selectedEmployee &&
                                <>
                                    <th className={'fw-bold'}>Отдел</th>
                                    {data ?
                                        Object.entries(data.total_data).map(([key, value]) => (
                                            <th className={'fw-bold'} key={key}>
                                                {key}{
                                                key !== 'Баланс' ?
                                                    value.confirmed ? "✅" : "❗" : ""
                                            }
                                            </th>
                                        ))
                                        :
                                        <>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '6vw', height: '100%'}}/></th>
                                        </>
                                    }
                                </>
                            }
                        </tr>

                        <tr>
                            {!selectedEmployee &&
                                <>
                                    <th className={'fw-bold'}>
                                        Итого:
                                    </th>
                                    {data ?
                                        Object.entries(data.total_data).map(([key, value]) => (
                                            <th className={'fw-bold'}
                                                key={key}
                                            >
                                                {value.total_wages?.toLocaleString("ru-RU")}
                                            </th>
                                        ))
                                        :
                                        <>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                            <th><AppSkeleton style={{width: '5vw', height: '100%'}}/></th>
                                        </>
                                    }
                                </>
                            }
                        </tr>
                        </thead>


                        <tbody>
                        {data?.detailed_data.map((employee) => (
                            <tr
                                key={employee.id}
                                onClick={() => setSelectedEmployee(
                                    selectedEmployee?.id === employee.id ?
                                        null :
                                        employee
                                )}
                            >
                                <td style={{
                                    height: '66px',
                                    width: '300px',
                                    backgroundColor: selectedEmployee?.id === employee.id ? "#becdd2" : "",
                                }}
                                >
                                    {employee.first_name} {employee.last_name}
                                </td>
                                {!selectedEmployee &&
                                    <>
                                        <td style={{
                                            width: '150px',
                                            height: '66px',
                                        }}>
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                overflowY: 'auto',
                                                overflowX: 'hidden',
                                                position: 'relative',
                                            }}>
                                                {employee.departments?.map((department) => (
                                                    <div
                                                        key={department.id}
                                                        className={'mx-1 px-1'}
                                                        style={{backgroundColor: department.color}}
                                                    >
                                                        {department.name}
                                                        <hr className={'m-1'}/>
                                                    </div>
                                                ))}
                                            </div>

                                        </td>
                                        <td>{
                                            Number(employee.current_balance).toLocaleString(
                                                'ru-RU'
                                            )}
                                        </td>
                                        {Object.entries(employee.weeks_info).map(([key, value]) => (
                                            <td key={key}>
                                                <div className={'text-muted'}>
                                                    {Number(value.total_accrual).toLocaleString('ru-RU')}
                                                    {!value.confirmed && "❗️"}
                                                </div>
                                                <hr className={'m-1'}/>
                                                {Number(value.total_wages).toLocaleString('ru-RU')}
                                            </td>
                                        ))}
                                    </>
                                }
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>

                {selectedEmployee &&
                    <WagesDetails employee={selectedEmployee}/>
                }

            </div>
        </Container>
    );
};
