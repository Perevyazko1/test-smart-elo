import React, {memo} from 'react';
import {Table} from "react-bootstrap";
import {classNames, Mods} from "shared/lib/classNames/classNames";

import {TaxControlData} from "../../model/types/TaxControlSchema";
import {TaxControlTableElement} from "./TaxControlTableElement";

interface TaxControlTableProps {
    tax_control_data: TaxControlData[]
    className?: string
}


export const TaxControlTable = memo((props: TaxControlTableProps) => {
    const {
        tax_control_data,
        className,
        ...otherProps
    } = props

    const mods: Mods = {};


    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
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
                {
                    tax_control_data?.map((tax_control_item) => (
                        <TaxControlTableElement
                            key={`${tax_control_item.department.name} ${tax_control_item.product.name}`}
                            tax_control_item={tax_control_item}
                        />
                    ))
                }
                </tbody>
            </Table>

        </div>
    );
});