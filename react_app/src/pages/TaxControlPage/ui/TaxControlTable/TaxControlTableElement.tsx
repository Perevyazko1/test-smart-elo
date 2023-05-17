import React, {memo, useState} from 'react';
import {useSelector} from "react-redux";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Slider} from "shared/ui/Slider/Slider";
import {Input} from "shared/ui/Input/Input";
import {getEmployeePinCode} from "entities/Employee";
import {product} from "entities/Product"
import {getHumansDatetime} from "shared/lib/getHumansDatetime/getHumansDatetime";

import {TaxControlData} from "../../model/types/TaxControlSchema";
import {useAppDispatch} from "../../../../shared/lib/hooks/useAppDispatch/useAppDispatch";
import {fetchSetTax, SetTaxModes} from "../../model/service/fetchSetTax/fetchSetTax";
import {taxControlActions} from "../../model/slice/taxControlPageSlice";

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

    const dispatch = useAppDispatch()
    const [currentTax, setCurrentTax] = useState(tax_control_item.production_step_tariff?.tariff)
    const pin_code = useSelector(getEmployeePinCode)

    const setTax = async () => {
        if (pin_code && currentTax !== undefined) {
            await dispatch(fetchSetTax({
                mode: SetTaxModes.ALL_UNCHARGED,
                pin_code: pin_code,
                department_number: tax_control_item.department.number,
                tariff: currentTax,
                product_id: tax_control_item.product.id
            }))
            dispatch(taxControlActions.setTaxControlUpdated())
        }
    }

    const create_image_uls_list = (product: product) => {
        const imageSet = new Set<string>()
        product.product_pictures?.map((product_picture) => (
            product_picture.image && imageSet.add(product_picture.image)
        ))
        return Array.from(imageSet)
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
                    defaultValue={tax_control_item.production_step_tariff?.tariff}
                    onChange={(e) => {
                        setCurrentTax(Number(e.target.value))
                    }}
                />
            </td>
            <td>
                {
                    tax_control_item.production_step_tariff
                        ?
                        getHumansDatetime(tax_control_item.production_step_tariff.confirmation_date)
                        :
                        "Тариф не утвержден"
                }
            </td>
            <td>
                {tax_control_item.production_step_tariff?.approved_by
                    ?
                    <>
                        {tax_control_item.production_step_tariff?.approved_by.first_name}
                        {tax_control_item.production_step_tariff?.approved_by.last_name}
                    </>
                    :
                    "Тариф не утвержден"
                }
            </td>
            <td>
                <button
                    type={'button'}
                    className={'btn btn-success'}
                    onClick={setTax}
                >
                    Утвердить
                </button>
            </td>
        </tr>
    );
});