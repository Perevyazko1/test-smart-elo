import {memo} from 'react';
import {useSelector} from "react-redux";
import {Button, Table} from "react-bootstrap";

import {order_product} from 'entities/OrderProduct';
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {GET_STATIC_URL} from "shared/const/server_config";

import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";
import {orderProductInfoActions} from "../../model/slice/OrderProductInfoSlice";
import {TechProcessWidget} from "../../../TechProcessWidget";

interface OpSelectedTechProcessProps {
    order_product: order_product;
    techProcessSelected: boolean;
    techProcessConfirmed: boolean;
}


export const OpSelectedTechProcess = memo((props: OpSelectedTechProcessProps) => {
    const {
        order_product,
        techProcessConfirmed,
        techProcessSelected,
    } = props

    const opInfoData = useSelector(getOPInfoData)
    const dispatch = useAppDispatch()

    const change_tech_process = (flag: boolean) => {
        dispatch(orderProductInfoActions.setChangeTP(flag))
    }

    const get_target_tech_process = () => {
        if (opInfoData?.current_tech_process) {
            return opInfoData?.current_tech_process
        } else {
            return order_product.product.technological_process
        }
    }

    const get_image_src = () => {
        if (opInfoData?.current_tech_process) {
            if (opInfoData?.current_tech_process.image) {
                return GET_STATIC_URL() + opInfoData?.current_tech_process.image
            } else {
                return null
            }
        } else if (order_product.product.technological_process?.image) {
            return GET_STATIC_URL() + order_product.product.technological_process?.image
        } else {
            return null
        }

    }


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
                    {techProcessConfirmed ? "Подтвердил" : "Изменить"}
                </th>
            </tr>
            </thead>
            <tbody>

            {techProcessSelected &&
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
                            <TechProcessWidget schema={get_target_tech_process()?.schema}
                                               disabled={true}
                            />
                        }
                    </td>
                    <td>
                        {get_target_tech_process()?.name}
                    </td>
                    <td>
                        {techProcessConfirmed ?
                            <div>
                                {order_product.product.technological_process_confirmed?.first_name
                                    + " " +
                                    order_product.product.technological_process_confirmed?.last_name
                                }
                            </div> :
                            <>
                                {opInfoData?.change_tech_process ?
                                    <Button type={'button'}
                                            variant={'warning'}
                                            onClick={() => change_tech_process(false)}>
                                        Отмена
                                    </Button> :
                                    <Button type={'button'}
                                            variant={'success'}
                                            onClick={() => change_tech_process(true)}>
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
});