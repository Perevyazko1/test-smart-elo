import {memo, ReactNode, useEffect} from 'react';
import {Table} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {order_product} from "entities/OrderProduct";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {useSelector} from "react-redux";
import {getCurrentDepartment} from "entities/Employee";

import {fetchOPTablesData} from "../../model/services/fetchOPTablesData/fetchOPTablesData";
import {getOPInfoData} from "../../model/selectors/getOPInfoData/getOPInfoData";

interface OPProductionInfoTableProps {
    order_product: order_product
    className?: string
    children?: ReactNode
}


export const OPProductionInfoTable = memo((props: OPProductionInfoTableProps) => {
    const {
        order_product,
        className,
        ...otherProps
    } = props


    const mods: Mods = {};

    const dispatch = useAppDispatch()
    const current_department = useSelector(getCurrentDepartment)
    const opInfoData = useSelector(getOPInfoData)

    useEffect(() => {
        if (current_department?.number && !opInfoData?.order_product_tables_data) {
            dispatch(fetchOPTablesData({
                series_id: order_product.series_id,
                department_number: current_department.number
            }))
        }
    }, [opInfoData, order_product, current_department, dispatch])

    return (
        <div
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Отдел</th>
                    <th>В работе</th>
                    <th>Готово</th>
                    <th>Подтверждено</th>
                </tr>
                </thead>
                <tbody>
                {opInfoData?.order_product_tables_data?.production_info?.map((info) => (
                    <tr key={info.department_name}>
                        <td>{info.department_name}</td>
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