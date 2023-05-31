import {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {Button, Table} from "react-bootstrap";

import {tech_process_schema} from "entities/TechnologicalProcess";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {GET_STATIC_URL} from "shared/const/server_config";

import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";
import {orderProductInfoActions} from "../../model/slice/OrderProductInfoSlice";
import {fetchTechProcesses} from "../../model/services/fetchTechProcesses/fetchTechProcesses";
import {fetchSetTechProcess} from "../../model/services/fetchSetTechProcess/fetchSetTechProcess";
import {eqAwaitListActions} from "../../../../pages/EQPage/model/slice/awaitListSlice";
import {eqInWorkListActions} from "../../../../pages/EQPage/model/slice/inWorkListSlice";
import {eqReadyListActions} from "../../../../pages/EQPage/model/slice/readyListSlice";
import {order_product} from "../../../../entities/OrderProduct";

interface OpTechProcessListProps {
    order_product: order_product
}


export const OpTechProcessList = memo((props: OpTechProcessListProps) => {
    const {
        order_product,
    } = props

    const dispatch = useAppDispatch()
    const opInfoData = useSelector(getOPInfoData)

    const set_tech_process = async (tech_process_id: number) => {
        await dispatch(fetchSetTechProcess({
            tech_process_id: tech_process_id,
            series_id: order_product.series_id
        }))
        dispatch(eqAwaitListActions.addNotRelevantId(order_product.id))
        dispatch(eqInWorkListActions.addNotRelevantId(order_product.id))
        dispatch(eqReadyListActions.addNotRelevantId(order_product.id))

        dispatch(orderProductInfoActions.setChangeTP(false))
        dispatch(orderProductInfoActions.setShowConstructor(false))
    }

    const setShowConstructorWithSchema = (schema: tech_process_schema) => {
        dispatch(orderProductInfoActions.setConstructorSchema(schema))
        dispatch(orderProductInfoActions.setShowConstructor(true))
        dispatch(orderProductInfoActions.setChangeTP(false))
    }

    useEffect(() => {
        dispatch(fetchTechProcesses({}))
    }, [dispatch])

    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <td colSpan={4} className={"fw-bold text-center bg-gradient bg-light"}>
                    Выберите технологический процесс:
                </td>
            </tr>

            <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>
                    Выбрать
                </th>
            </tr>
            </thead>

            <tbody>
            {opInfoData?.tech_process_list?.map((tech_process) => (
                <tr key={tech_process.name}>
                    <td>
                        <img
                            src={GET_STATIC_URL() + tech_process.image}
                            alt={tech_process.name}
                            style={{maxWidth: "500px", maxHeight: "400px"}}
                            loading={'lazy'}
                        />
                    </td>
                    <td>{tech_process.name}</td>
                    <td>
                        <div className={'d-flex flex-column'}
                        >
                            <Button type={'button'}
                                    variant={'success'}
                                    onClick={() => set_tech_process(tech_process.id)}
                            >
                                Выбрать
                            </Button>

                            <Button type={'button'}
                                    style={{maxWidth: '120px'}}
                                    className={'mt-4'}
                                    onClick={() => setShowConstructorWithSchema(tech_process.schema)}
                            >
                                Создать на основании данного
                            </Button>
                        </div>
                    </td>
                </tr>
            ))}
            <tr>
                <td colSpan={3}>
                    <Button type={'button'}
                            className={'my-4 w-100'}
                            onClick={() => setShowConstructorWithSchema({})}
                    >
                        Создать новый технологический процесс
                    </Button>
                </td>
            </tr>

            </tbody>
        </Table>
    );
});