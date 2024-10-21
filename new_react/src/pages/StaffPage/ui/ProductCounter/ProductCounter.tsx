import React, {useCallback, useEffect, useState} from "react";

import {Form, Table} from "react-bootstrap";


import {ReadySection} from "@pages/TaskPage";
import {AppSkeleton, AppSlider, AppSwitch, AppTooltip} from "@shared/ui";

import {GetAssignmentCounts} from "../../model/api/api";


interface ProductCounterProps {
    employee__id: number;
    date_from: string;
    date_by: string;
}


export const ProductCounter = (props: ProductCounterProps) => {
    const [dateBy, setDateBy] = useState<string>(props.date_by.slice(0, 10));
    const [dateFrom, setDateFrom] = useState<string>(props.date_from.slice(0, 10));
    const [isDateValid, setIsDateValid] = useState<boolean>(true);

    const [getByVisaDate, setGetByVisaDate] = useState(false);

    const isValidDateRange = useCallback((dateFrom: string, dateBy: string) => {
        const minDate = new Date("2000-01-01");
        const maxDate = new Date("2050-12-31");

        const fromDate = new Date(dateFrom);
        const byDate = new Date(dateBy);

        // Проверка формата даты
        const isValidFormat = (dateString: string) => {
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            return regex.test(dateString);
        };

        // Проверка валидности даты
        const isValidDate = (date: Date) => {
            return !isNaN(date.getTime());
        };

        // Проверка, что дата не раньше 2000 года и не позже 2050 года
        const isWithinRange = (date: Date) => {
            return date >= minDate && date <= maxDate;
        };

        // Проверка, что дата начала меньше даты окончания
        const isFromBeforeBy = (from: Date, by: Date) => {
            return from <= by;
        };

        if (!isValidFormat(dateFrom) || !isValidFormat(dateBy)) return false;
        if (!isValidDate(fromDate) || !isValidDate(byDate)) return false;
        if (!isWithinRange(fromDate) || !isWithinRange(byDate)) return false;
        if (!isFromBeforeBy(fromDate, byDate)) return false;

        return true;
    }, []);

    const {data, isLoading, isFetching} = GetAssignmentCounts({
        employee__id: props.employee__id,
        date_from: dateFrom,
        date_by: dateBy,
        select_by_visa: getByVisaDate,
    }, {skip: !isValidDateRange(dateFrom, dateBy)});

    useEffect(() => {
        setDateBy(props.date_by.slice(0, 10))
    }, [props.date_by]);

    useEffect(() => {
        setDateFrom(props.date_from.slice(0, 10))
    }, [props.date_from]);

    useEffect(() => {
        setIsDateValid(isValidDateRange(dateFrom, dateBy));
    }, [dateFrom, dateBy, isValidDateRange]);

    return (
        <div>
            <div className={'d-flex align-items-center fs-5 mb-1'}>
                Отработка сотрудника
                <AppTooltip
                    title={'В случае, когда наряд был тарифицирован после визирования бригадиром - дата визирования и дата начисления могут отличаться'}>
                    <AppSwitch
                        checked={getByVisaDate}
                        style={{transform: "scale(0.8)", fontSize: '10px'}}
                        onSwitch={() => setGetByVisaDate(!getByVisaDate)}
                        label={getByVisaDate ? "(По дате визирования)" : '(По дате начисления)'}
                    />
                </AppTooltip>
            </div>
            <Form className={'mb-1 fs-7 d-flex gap-3 fw-bold'}>
                <Form.Group controlId="date_from" className={'d-flex align-items-center gap-2'}>
                    <Form.Label>Дата с:</Form.Label>
                    <AppTooltip title={'Данное поле можно установить в индивидуальное значение'}>
                        <Form.Control type="date"
                                      name="date_from"
                                      value={dateFrom}
                                      isInvalid={!isDateValid}
                                      onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </AppTooltip>
                </Form.Group>
                <Form.Group controlId="date_by" className={'d-flex align-items-center gap-2'}>
                    <Form.Label>Дата по:</Form.Label>
                    <AppTooltip title={'Данное поле можно установить в индивидуальное значение'}>
                        <Form.Control type="date"
                                      name="date_by"
                                      value={dateBy}
                                      isInvalid={!isDateValid}
                                      onChange={(e) => setDateBy(e.target.value)}
                        />
                    </AppTooltip>
                </Form.Group>
            </Form>

            <h6><b>Изделия: </b></h6>

            <Table size={'sm'} bordered>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Наименование изделия</th>
                    <th>Колич.</th>
                    <th>Отдел</th>
                    <th>Сделка</th>
                    <th>Итого</th>
                </tr>
                </thead>

                <tbody>
                {isLoading || isFetching ?
                    <>
                        <tr>
                            <td colSpan={6}><AppSkeleton style={{width: '100%', height: '25px'}}/></td>
                        </tr>
                        <tr>
                            <td colSpan={6}><AppSkeleton style={{width: '100%', height: '25px'}}/></td>
                        </tr>
                        <tr>
                            <td colSpan={6}><AppSkeleton style={{width: '100%', height: '25px'}}/></td>
                        </tr>
                    </>
                    :
                    <>
                        {data?.results.map((assignmentInfo) => (
                            <tr className={'fs-7'} key={assignmentInfo.product_name + assignmentInfo.department_name}>
                                <td>
                                    {assignmentInfo.thumbnail_urls.length > 0 ?
                                        <AppSlider width={'40px'} height={'40px'}
                                                   images={assignmentInfo.thumbnail_urls}
                                        />
                                        :
                                        <>БИ</>
                                    }
                                </td>
                                <td>{assignmentInfo.product_name}</td>
                                <td>
                                    <b>{assignmentInfo.count} </b>
                                    {assignmentInfo.co_executor_count > 0 && (
                                        <b>({assignmentInfo.co_executor_count}) </b>
                                    )}
                                    шт
                                </td>
                                <td>{assignmentInfo.department_name}</td>
                                <td>{assignmentInfo.amount_range}</td>
                                <td>{assignmentInfo.total_amount}</td>
                            </tr>
                        ))}
                    </>
                }
                </tbody>
            </Table>

            <h6><b>Задачи: </b></h6>

            <Table size={'sm'} bordered>
                <tbody>
                <tr>
                    <td>
                        {isValidDateRange(dateFrom, dateBy) && (
                            <ReadySection
                                eqMode={true}
                                targetUserId={props.employee__id}
                                start_date={dateFrom}
                                end_date={dateBy}
                            />
                        )}
                    </td>
                </tr>
                </tbody>

            </Table>
        </div>
    )
}
