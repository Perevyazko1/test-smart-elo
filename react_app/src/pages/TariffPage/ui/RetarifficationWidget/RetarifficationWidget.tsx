import React, {memo, ReactNode} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Button, Table} from "react-bootstrap";
import {TariffPageCard} from "../../model/types/types";

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

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <h5>
                {`Тарификация нарядов: ${card.department.name} - ${card.product.name}`}
            </h5>

            <Button
                size={'sm'}
                variant={'warning'}
                className={'mt-1'}
            >
                Создать начисление за выполнение выбранных нарядов в размере: <b>{card.production_step_tariff?.tariff}</b>
            </Button>

            <Table striped bordered hover size="sm" className={'mt-2'}>

                <thead>
                <tr>
                    <th className={'fw-bold'}>
                        <Button
                            size={'sm'}
                            variant={'outline-dark'}
                            className={'m-0'}
                        >
                            Все✔️
                        </Button>
                    </th>
                    <th className={'fw-bold'}>
                        Номер наряда
                    </th>
                    <th className={'fw-bold'}>
                        Исполнитель / Получатель
                    </th>
                    <th className={'fw-bold'}>
                        Дата готовности
                    </th>
                    <th className={'fw-bold'}>
                        Дата визирования
                    </th>

                </tr>
                </thead>
                <tbody>

                <tr>
                    <td>
                        <div className={'d-flex justify-content-center w-100'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{transform: "scale(1.5)"}}
                            />
                        </div>
                    </td>
                    <td>
                        Наряд № 1[2]23433
                    </td>
                    <td>
                        Борисенко Артем
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className={'d-flex justify-content-center w-100'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{transform: "scale(1.5)"}}
                            />
                        </div>
                    </td>
                    <td>
                        Наряд № 1[2]23433
                    </td>
                    <td>
                        Борисенко Артем
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className={'d-flex justify-content-center w-100'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{transform: "scale(1.5)"}}
                            />
                        </div>
                    </td>
                    <td>
                        Наряд № 1[2]23433
                    </td>
                    <td>
                        Борисенко Артем
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className={'d-flex justify-content-center w-100'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{transform: "scale(1.5)"}}
                            />
                        </div>
                    </td>
                    <td>
                        Наряд № 1[2]23433
                    </td>
                    <td>
                        Борисенко Артем
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className={'d-flex justify-content-center w-100'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{transform: "scale(1.5)"}}
                            />
                        </div>
                    </td>
                    <td>
                        Наряд № 1[2]23433
                    </td>
                    <td>
                        Борисенко Артем
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className={'d-flex justify-content-center w-100'}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{transform: "scale(1.5)"}}
                            />
                        </div>
                    </td>
                    <td>
                        Наряд № 1[2]23433
                    </td>
                    <td>
                        Борисенко Артем
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                    <td>
                        22.08.2023 - 14:52:07
                    </td>
                </tr>

                </tbody>
            </Table>
        </div>
    );
});