import {Button, Spinner, Table} from "react-bootstrap";
import React, {memo, ReactNode, useState} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {getHumansDatetime} from "shared/lib/getHumansDatetime/getHumansDatetime";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {getEmployeePinCode} from "entities/Employee";

import {Ordering, TariffPageCard} from "../../model/types/types";
import {usePostRetariffication, useRetarifficationList} from "../../model/api/api";

interface RetarifficationWidgetProps {
    card: TariffPageCard;
    className?: string;
    children?: ReactNode;
}


export const RetarifficationWidget = memo((props: RetarifficationWidgetProps) => {
        const {
            card,
            className,
            children,
            ...otherProps
        } = props;

        const mods: Mods = {};

        const pinCode = useAppSelector(getEmployeePinCode);

        const [selectedIds, setSelectedIds] = useState<number[]>([]);
        const [ordering, setOrdering] = useState<Ordering>(null);

        const handleSelectAll = () => {
            if (data) {
                const allIds = data.map(retariffication => retariffication.id);
                setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
            }
        };

        const editSelectedIds = (id: number, checked: boolean) => {
            if (checked) {
                setSelectedIds([...selectedIds, id])
            } else {
                setSelectedIds(selectedIds.filter(element => element !== id))
            }
        }

        const {data, isLoading, isFetching} = useRetarifficationList({
            ordering: ordering,
            product__id: card.product.id,
            department__number: card.department.number,
        });

        const [postRetariffication, {isLoading: isPosting}] = usePostRetariffication();

        const handlePostRetariffication = () => {
            if (pinCode && selectedIds) {
                postRetariffication({
                    ids: selectedIds,
                    pin_code: pinCode,
                });
            }
        };

        const getSortIcon = (order_mode: 'ascending' | 'descending' | null) => {
            if (isFetching) {
                return (
                    <Spinner animation={'grow'} size={'sm'} className={'ms-2'}/>
                )
            } else if (order_mode === null) {
                return (<></>);
            } else if (order_mode === 'ascending') {
                return (
                    <i className="fas fa-sort-amount-up ms-2"/>
                );
            } else {
                return (
                    <i className="fas fa-sort-amount-down ms-2"/>
                );
            }
        }


        return (
            <div
                className={classNames('', mods, [className])}
                {...otherProps}
            >
                <h5>
                    {`Тарификация нарядов: ${card.department.name} - ${card.product.name}`}
                </h5>

                {isLoading
                    ? <Spinner animation={'grow'}/>
                    :
                    data && data.length > 0 ?
                        <>
                            <Button
                                size={'sm'}
                                variant={'warning'}
                                className={'mt-1'}
                                disabled={!(selectedIds.length > 0) || isPosting}
                                onClick={handlePostRetariffication}
                            >
                                Создать начисление за выполнение выбранных нарядов в
                                размере: <b>{card.production_step_tariff?.tariff}</b>
                            </Button>

                            <Table striped bordered hover size="sm" className={'mt-2'}>

                                <thead>
                                <tr>
                                    <th className={'fw-bold'}>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-dark'}
                                            className={'m-0'}
                                            onClick={handleSelectAll}
                                        >
                                            Все✔️
                                        </Button>
                                    </th>
                                    <th className={'fw-bold'}>
                                        Номер наряда
                                    </th>
                                    <th className={'fw-bold'}
                                        onClick={() => {
                                            setOrdering(ordering === 'executor' ?
                                                '-executor' : ordering === '-executor' ?
                                                    null : 'executor'
                                            )
                                        }}
                                        style={{cursor: "pointer"}}
                                    >
                                        Исполнитель / Получатель
                                        {getSortIcon(ordering === 'executor' ? 'ascending' :
                                            ordering === '-executor' ? 'descending' : null)}
                                    </th>
                                    <th className={'fw-bold'}
                                        onClick={() => {
                                            setOrdering(ordering === 'date_completion' ?
                                                '-date_completion' : ordering === '-date_completion' ?
                                                    null : 'date_completion'
                                            )
                                        }}
                                        style={{cursor: "pointer"}}
                                    >
                                        Дата готовности
                                        {getSortIcon(ordering === 'date_completion' ? 'ascending' :
                                            ordering === '-date_completion' ? 'descending' : null)}
                                    </th>
                                    <th className={'fw-bold'}
                                        onClick={() => {
                                            setOrdering(ordering === 'inspect_date' ?
                                                '-inspect_date' : ordering === '-inspect_date' ?
                                                    null : 'inspect_date'
                                            )
                                        }}
                                        style={{cursor: "pointer"}}
                                    >
                                        Дата визирования

                                        {getSortIcon(ordering === 'inspect_date' ? 'ascending' :
                                            ordering === '-inspect_date' ? 'descending' : null)}
                                    </th>

                                </tr>
                                </thead>
                                <tbody>

                                {data.map((retariffication) => (
                                    <tr key={retariffication.id}>
                                        <td>
                                            <div className={'d-flex justify-content-center w-100'}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    style={{transform: "scale(1.5)"}}
                                                    onChange={(event) => editSelectedIds(
                                                        retariffication.id,
                                                        event.currentTarget.checked
                                                    )}
                                                    checked={selectedIds.includes(retariffication.id)}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            Наряд {retariffication.string_representation}
                                        </td>
                                        <td>
                                            {retariffication.executor.first_name} {retariffication.executor.last_name}
                                        </td>
                                        <td>
                                            {retariffication.date_completion &&
                                                getHumansDatetime(retariffication.date_completion)
                                            }
                                        </td>
                                        <td>
                                            {retariffication.inspect_date &&
                                                getHumansDatetime(retariffication.inspect_date)
                                            }
                                        </td>
                                    </tr>
                                ))}

                                </tbody>
                            </Table>
                        </>
                        :
                        <h3>Хвостов в рамках тарификации нет</h3>
                }
            </div>
        );
    })
;