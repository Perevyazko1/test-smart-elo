import React, {memo, useState} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Slider} from "shared/ui/Slider/Slider";
import {Input} from "shared/ui/Input/Input";
import {product} from "entities/Product"

import {TaxControlData} from "../../model/types/TaxControlSchema";

interface TaxControlTableElementProps {
    tax_control_item: TaxControlData
    className?: string
}


export const TaxControlTableElement = memo((props: TaxControlTableElementProps) => {
    const {
        className,
        tax_control_item,
        ...otherProps
    } = props

    const [currentTax, setCurrentTax] = useState(tax_control_item.tariff?.tariff)

    const create_image_uls_list = (product: product) => {
        const result: string[] = []
        product.product_pictures?.map((product_picture) => (
            product_picture.image && result.push(product_picture.image)
        ))
        return result
    }

    const mods: Mods = {};

    return (
        <tr
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <td>
                <Slider images={create_image_uls_list(tax_control_item.product)}/>
            </td>

            <td>
                {tax_control_item.product.name}
            </td>

            <td>{tax_control_item.department.name}</td>
            <td>
                <Input
                    type={'number'}
                    style={{width: "100px"}}
                    defaultValue={tax_control_item.tariff?.tariff}
                    onChange={(e) => {
                        setCurrentTax(Number(e.target.value))
                    }}
                />
            </td>
            <td>{tax_control_item.tariff?.confirmation_date || "Тариф не утвержден"}</td>
            <td>
                {tax_control_item.tariff?.approved_by
                    ?
                    <>
                        {tax_control_item.tariff?.approved_by.first_name}
                        {tax_control_item.tariff?.approved_by.last_name}
                    </>
                    :
                    "Тариф не утвержден"
                }
            </td>
            <td>
                <button
                    type={'button'}
                    className={'btn btn-success'}
                    onClick={() => console.log(`Утвердить на текущий этап стоимость ${currentTax}`)}
                >
                    Утвердить
                </button>
            </td>
        </tr>
    );
});