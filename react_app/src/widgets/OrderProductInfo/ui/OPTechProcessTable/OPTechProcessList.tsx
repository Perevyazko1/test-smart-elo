import {memo} from 'react';
import {useSelector} from "react-redux";
import {Button, Table} from "react-bootstrap";

import {tech_process_schema} from "entities/TechnologicalProcess";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {GET_STATIC_URL} from "shared/const/server_config";

import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";
import {orderProductInfoActions} from "../../model/slice/OrderProductInfoSlice";

interface OpTechProcessListProps {
    set_tech_process: (tech_process_id: number) => void
}


export const OpTechProcessList = memo((props: OpTechProcessListProps) => {
    const {
        set_tech_process,
    } = props

    const dispatch = useAppDispatch()
    const opInfoData = useSelector(getOPInfoData)

    const setShowConstructorWithSchema = (schema: tech_process_schema) => {
        dispatch(orderProductInfoActions.setConstructorSchema(schema))
        dispatch(orderProductInfoActions.setShowConstructor(true))
        dispatch(orderProductInfoActions.setChangeTP(false))
    }

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