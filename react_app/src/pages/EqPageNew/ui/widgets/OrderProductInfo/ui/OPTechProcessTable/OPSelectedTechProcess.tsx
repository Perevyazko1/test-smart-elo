import {useCallback, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {Button, Table} from "react-bootstrap";

import {TechProcessWidget} from "widgets/TechProcessWidget";
import {eq_card} from "entities/EqPageCard";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {GET_STATIC_URL} from "shared/const/server_config";

import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";
import {orderProductInfoActions} from "../../model/slice/OrderProductInfoSlice";

interface OpSelectedTechProcessProps {
    order_product: eq_card;
}


export const OpSelectedTechProcess = (props: OpSelectedTechProcessProps) => {
    const {
        order_product,
    } = props

    const dispatch = useAppDispatch();
    const opInfoData = useSelector(getOPInfoData);
    const [techProcess, setTechProcess] = useState(order_product.product.technological_process)

    useEffect(() => {
        setTechProcess(order_product.product.technological_process)
    }, [order_product.product.technological_process])

    const change_tech_process = (flag: boolean) => {
        dispatch(orderProductInfoActions.setChangeTP(flag))
    }

    const getTPConfirmed = useCallback(() => {
        return !!order_product.product.technological_process_confirmed
    }, [order_product.product.technological_process_confirmed])

    const getTPSelected = useCallback(() => {
        return !!order_product.product.technological_process
    }, [order_product.product.technological_process])

    const editTechProcess = () => {
        dispatch(orderProductInfoActions.setConstructorSchema(
            techProcess?.schema || {})
        )
        dispatch(orderProductInfoActions.setShowConstructor(true))
        dispatch(orderProductInfoActions.setChangeTP(true))
    }

    const get_image_src = useCallback(() => {
        if (techProcess?.image) {
            return GET_STATIC_URL() + techProcess?.image
        } else {
            return null
        }
    }, [techProcess?.image])


    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <td colSpan={3} className={"fw-bold text-center bg-gradient bg-light"}>
                    Текущий технологический процесс
                </td>
            </tr>
            <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>
                    {getTPConfirmed() ? "Подтвердил" : "Изменить"}
                </th>
            </tr>
            </thead>
            <tbody>

            {getTPSelected() &&
                <tr>
                    <td>
                        {get_image_src()
                            ?
                            <img src={get_image_src() || ""}
                                 alt={'Без изображения'}
                                 loading={"lazy"}
                                 style={{maxHeight: '400px', maxWidth: '500px'}}
                            />
                            :
                            <TechProcessWidget schema={techProcess?.schema}
                                               disabled={true}
                            />
                        }
                    </td>
                    <td>
                        {techProcess?.name}
                    </td>
                    <td>
                        {getTPConfirmed()
                            ?
                            <div>
                                {order_product.product.technological_process_confirmed?.first_name
                                    + " " +
                                    order_product.product.technological_process_confirmed?.last_name
                                }
                            </div>
                            :
                            <>
                                {opInfoData?.change_tech_process ?
                                    <Button type={'button'}
                                            variant={'warning'}
                                            onClick={() => change_tech_process(false)}>
                                        Отмена
                                    </Button> :
                                    <Button type={'button'}
                                            variant={'success'}
                                            onClick={editTechProcess}>
                                        Изменить
                                    </Button>}
                            </>
                        }
                    </td>
                </tr>
            }
            </tbody>
        </Table>
    );
};