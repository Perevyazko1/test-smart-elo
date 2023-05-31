import {memo, ReactNode, useEffect} from 'react';
import {useSelector} from "react-redux";
import {Table} from "react-bootstrap";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {getCurrentDepartment} from "entities/Employee";
import {order_product} from 'entities/OrderProduct'

import {fetchOPTablesData} from "../../model/services/fetchOPTablesData/fetchOPTablesData";
import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";

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
    const opInfoData = useSelector(getOPInfoData)

    useEffect(() => {
        if (current_department?.number && !opInfoData?.order_product_tables_data?.department_info) {
            dispatch(fetchOPTablesData({
                series_id: order_product.series_id,
                department_number: current_department.number
            }))
        }
        //eslint-disable-next-line
    }, [dispatch])

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
                {opInfoData?.order_product_tables_data?.department_info?.map((info) => (
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