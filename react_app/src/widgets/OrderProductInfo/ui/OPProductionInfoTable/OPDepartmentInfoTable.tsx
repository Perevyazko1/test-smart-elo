import {memo, ReactNode} from 'react';
import {Table} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";

interface OpDepartmentInfoTableProps {
    className?: string
    children?: ReactNode
}


export const OpDepartmentInfoTable = memo((props: OpDepartmentInfoTableProps) => {
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
                    <th>ФИО</th>
                    <th>В работе</th>
                    <th>Готово</th>
                    <th>Подтверждено</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Борисенко Артем</td>
                    <td>1</td>
                    <td>2</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>Иванов Иван</td>
                    <td>3</td>
                    <td>3</td>
                    <td>2</td>
                </tr>
                </tbody>
            </Table>
        </div>
    );
});