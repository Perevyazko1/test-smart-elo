import React, {memo, ReactNode, useCallback} from 'react';
import {useSelector} from "react-redux";

import {TechProcessWidget} from "widgets/TechProcessWidget";
import {eq_card} from "entities/EqPageCard";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {eqAwaitListActions} from "pages/EQPage/model/slice/awaitListSlice";
import {eqReadyListActions} from "pages/EQPage/model/slice/readyListSlice";
import {eqInWorkListActions} from "pages/EQPage/model/slice/inWorkListSlice";

import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";
import {orderProductInfoActions} from "../../model/slice/OrderProductInfoSlice";
import {OpSelectedTechProcess} from "./OPSelectedTechProcess";
import {OpTechProcessList} from "./OPTechProcessList";
import {fetchSetCustomTechProcess} from "../../model/services/fetchSetCustomTechProcess/fetchSetCustomTechProcess";

interface OPTechProcessTableProps {
    order_product: eq_card
    className?: string
    children?: ReactNode
}


export const OPTechProcessTable = memo((props: OPTechProcessTableProps) => {
    const {
        order_product,
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const opInfoData = useSelector(getOPInfoData)

    const getProcessSelected = useCallback(() => {
        return !!order_product.product.technological_process
    }, [order_product.product.technological_process])

    const set_custom_tech_process = (schema: tech_process_schema) => {
        dispatch(fetchSetCustomTechProcess({
            schema: schema,
            series_id: order_product.series_id
        })).then(() => {
            dispatch(eqAwaitListActions.addNotRelevantId(order_product.id))
            dispatch(eqInWorkListActions.addNotRelevantId(order_product.id))
            dispatch(eqReadyListActions.addNotRelevantId(order_product.id))

            dispatch(orderProductInfoActions.setShowConstructor(false))
            dispatch(orderProductInfoActions.setChangeTP(false))
        })
    }

    const on_cancellation_constructor = () => {
        dispatch(orderProductInfoActions.setShowConstructor(false))
        if (getProcessSelected()) {
            dispatch(orderProductInfoActions.setChangeTP(false))
        } else {
            dispatch(orderProductInfoActions.setChangeTP(true))
        }
    }

    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            {opInfoData?.show_constructor &&
                <TechProcessWidget
                    className={'mb-3'}
                    schema={opInfoData.constructor_schema || {}}
                    onSubmitData={(data: tech_process_schema) => set_custom_tech_process(data)}
                    onCancellation={on_cancellation_constructor}
                />
            }

            {getProcessSelected() && !opInfoData?.show_constructor &&
                <OpSelectedTechProcess
                    order_product={order_product}
                />
            }

            {opInfoData?.change_tech_process &&
                <OpTechProcessList order_product={order_product}/>
            }
        </div>
    );
});