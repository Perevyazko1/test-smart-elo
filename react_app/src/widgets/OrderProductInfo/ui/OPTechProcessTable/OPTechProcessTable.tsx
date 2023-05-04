import {memo, ReactNode, useEffect, useState} from 'react';
import {Button, Table} from "react-bootstrap";
import {useSelector} from "react-redux";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {order_product} from "entities/OrderProduct";
import {eqActions} from "pages/EQPage";

import {getTechProcessList} from "../../model/selectors/getTechProcessList/getTechProcessList";
import {fetchTechProcesses} from "../../model/services/fetchTechProcesses/fetchTechProcesses";
import {fetchSetTechProcess} from "../../model/services/fetchSetTechProcess/fetchSetTechProcess";
import {getCurrentTechProcess} from "../../model/selectors/getCurrentTechProcess/getCurrentTechProcess";

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

    const [changeTechProcess, setChangeTechProcess] = useState(false)
    const tech_process_list = useSelector(getTechProcessList)
    const current_tech_process = useSelector(getCurrentTechProcess)
    const dispatch = useAppDispatch()

    const techProcessSelected = order_product.product.technological_process || current_tech_process || false
    const techProcessConfirmed = order_product.product.technological_process_confirmed || false

    useEffect(() => {
        if (!tech_process_list && !techProcessConfirmed) {
            dispatch(fetchTechProcesses({}))
        }
        if (!techProcessSelected && !changeTechProcess) {
            setChangeTechProcess(true)
        }
    }, [dispatch, tech_process_list, techProcessConfirmed, changeTechProcess, techProcessSelected])

    const change_tech_process = () => {
        setChangeTechProcess(!changeTechProcess)
    }

    const set_tech_process = async (tech_process_id: number) => {
        await dispatch(fetchSetTechProcess({
            tech_process_id: tech_process_id,
            series_id: order_product.series_id
        }))
        await dispatch(eqActions.eqUpdated())
        setChangeTechProcess(!changeTechProcess)
    }

    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            {techProcessSelected &&
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
                                <img
                                    src={
                                        current_tech_process
                                            ?
                                            current_tech_process.image
                                            :
                                            order_product.product.technological_process?.image
                                    }
                                    alt={
                                        current_tech_process
                                            ?
                                            current_tech_process.name
                                            :
                                            order_product.product.technological_process?.name
                                    }
                                    style={{maxWidth: "500px", maxHeight: "400px"}}
                                    loading={'lazy'}
                                />
                            </td>
                            <td>
                                {
                                    current_tech_process
                                        ?
                                        current_tech_process.name
                                        :
                                        order_product.product.technological_process?.name
                                }
                            </td>
                            <td>
                                {techProcessConfirmed ?
                                    <div>
                                        {order_product.product.technological_process_confirmed?.first_name}
                                        {order_product.product.technological_process_confirmed?.last_name}
                                    </div> :
                                    <>
                                        {changeTechProcess ?
                                            <Button type={'button'} variant={'warning'} onClick={change_tech_process}>
                                                Отмена
                                            </Button> :
                                            <Button type={'button'} variant={'success'} onClick={change_tech_process}>
                                                Изменить
                                            </Button>}
                                    </>
                                }
                            </td>
                        </tr>
                    }
                    </tbody>
                </Table>
            }

            {changeTechProcess &&
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
                    {tech_process_list?.map((tech_process) => (
                        <tr key={tech_process.name}>
                            <td>
                                <img
                                    src={tech_process.image}
                                    alt={tech_process.name}
                                    style={{maxWidth: "500px", maxHeight: "400px"}}
                                    loading={'lazy'}
                                />
                            </td>
                            <td>{tech_process.name}</td>
                            <td>
                                <Button type={'button'}
                                        variant={'success'}
                                        onClick={() => set_tech_process(tech_process.id)}
                                >
                                    Выбрать
                                </Button>
                            </td>
                        </tr>
                    ))}

                    </tbody>
                </Table>
            }
        </div>
    );
});