import {memo, ReactNode} from 'react';
import {Table} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";

interface OPProductionInfoTableProps {
    className?: string
    children?: ReactNode
}


export const OPProductionInfoTable = memo((props: OPProductionInfoTableProps) => {
    const {
        className,
        ...otherProps
    } = props

    const mods: Mods = {};

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
                <tr>
                    <td>Конструктора</td>
                    <td>1</td>
                    <td>2</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>Обивка</td>
                    <td>3</td>
                    <td>3</td>
                    <td>2</td>
                </tr>
                </tbody>
            </Table>
        </div>
    );
});