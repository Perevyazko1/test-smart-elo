import {memo, ReactNode, useEffect} from 'react';
import {useSelector} from "react-redux";
import {Table} from "react-bootstrap";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {order_product} from 'entities/OrderProduct'

import {getOPDepartmentInfo} from "../../model/selectors/getOPDepartmentInfo/getOPDepartmentInfo";
import {fetchOPTablesData} from "../../model/services/fetchOPTablesData/fetchOPTablesData";
import {getCurrentDepartment} from "../../../../entities/Employee";

interface OpDepartmentInfoTableProps {
    order_product: order_product
    className?: string
    children?: ReactNode
}


export const OpDepartmentInfoTable = memo((props: OpDepartmentInfoTableProps) => {
    const {
        order_product,
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const current_department = useSelector(getCurrentDepartment)
    const department_info = useSelector(getOPDepartmentInfo)

    useEffect(() => {
        if (current_department?.number && !department_info) {
            dispatch(fetchOPTablesData({
                series_id: order_product.series_id,
                department_number: current_department.number
            }))
        }
    }, [department_info, order_product, current_department, dispatch])


    const mods: Mods = {};

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ФИО</th>
                    <th>В работе</th>
                    <th>Готово</th>
                    <th>Подтверждено</th>
                </tr>
                </thead>
                <tbody>
                {department_info?.map((info) => (
                    <tr key={info.full_name}>
                        <td>{info.full_name}</td>
                        <td className={"fw-bolder"}>{info.in_work > 0 ? info.in_work : ""}</td>
                        <td className={"fw-bolder"}>{info.ready > 0 ? info.ready : ""}</td>
                        <td className={"fw-bolder"}>{info.confirmed > 0 ? info.confirmed : ""}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
});