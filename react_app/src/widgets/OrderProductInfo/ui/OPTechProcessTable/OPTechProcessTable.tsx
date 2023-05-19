import {memo, ReactNode, useCallback, useEffect} from 'react';
import {useSelector} from "react-redux";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {order_product} from "entities/OrderProduct";
import {eqActions} from "pages/EQPage";

import {fetchTechProcesses} from "../../model/services/fetchTechProcesses/fetchTechProcesses";
import {fetchSetTechProcess} from "../../model/services/fetchSetTechProcess/fetchSetTechProcess";
import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";
import {orderProductInfoActions} from "../../model/slice/OrderProductInfoSlice";
import {OpSelectedTechProcess} from "./OPSelectedTechProcess";
import {OpTechProcessList} from "./OPTechProcessList";
import {TechProcessWidget} from "../../../TechProcessWidget";
import {fetchSetCustomTechProcess} from "../../model/services/fetchSetCustomTechProcess/fetchSetCustomTechProcess";
import {tech_process_schema} from "../../../../entities/TechnologicalProcess";

interface OPTechProcessTableProps {
    order_product: order_product
    className?: string
    children?: ReactNode
}


export const OPTechProcessTable = memo((props: OPTechProcessTableProps) => {
    const {
        order_product,
        className,
        ...otherProps
    } = props

    const opInfoData = useSelector(getOPInfoData)
    const dispatch = useAppDispatch()

    const getProcessConfirmed = useCallback(() => {
        return !!order_product.product.technological_process_confirmed;
    }, [order_product.product.technological_process_confirmed])

    const getProcessSelected = useCallback(() => {
        if (order_product.product.technological_process) {
            return true
        } else return !!opInfoData?.current_tech_process;
    }, [opInfoData?.current_tech_process, order_product.product.technological_process])

    useEffect(() => {
        if (!opInfoData?.tech_process_list && !getProcessConfirmed()) {
            dispatch(fetchTechProcesses({}))
        }
        if (!getProcessSelected() && !opInfoData?.change_tech_process && !opInfoData?.show_constructor) {
            dispatch(orderProductInfoActions.setChangeTP(true))
        }
    }, [dispatch, getProcessConfirmed, getProcessSelected, opInfoData?.change_tech_process,
        opInfoData?.show_constructor, opInfoData?.tech_process_list])

    const set_tech_process = async (tech_process_id: number) => {
        await dispatch(fetchSetTechProcess({
            tech_process_id: tech_process_id,
            series_id: order_product.series_id
        }))
        await dispatch(eqActions.eqUpdated())
        await dispatch(orderProductInfoActions.setChangeTP(false))
    }

    const set_custom_tech_process = async (schema: tech_process_schema) => {
        await dispatch(fetchSetCustomTechProcess({
            schema: schema,
            series_id: order_product.series_id
        }))
        await dispatch(orderProductInfoActions.setShowConstructor(false))
        await dispatch(eqActions.eqUpdated())
        await dispatch(orderProductInfoActions.setChangeTP(false))
    }

    const on_cancellation_constructor = () => {
        dispatch(orderProductInfoActions.setShowConstructor(false))
        dispatch(orderProductInfoActions.setChangeTP(true))
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
                    onSubmitData={(data) => set_custom_tech_process(data)}
                    onCancellation={on_cancellation_constructor}
                />
            }

            {getProcessSelected() && !opInfoData?.show_constructor &&
                <OpSelectedTechProcess
                    order_product={order_product}
                    techProcessConfirmed={getProcessConfirmed()}
                    techProcessSelected={getProcessSelected()}
                />
            }

            {opInfoData?.change_tech_process &&
                <OpTechProcessList set_tech_process={set_tech_process}/>
            }
        </div>
    );
});