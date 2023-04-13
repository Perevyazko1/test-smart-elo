import {memo, ReactNode} from 'react';
import {Button, Table} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import test_img from 'shared/assets/images/SZMK Logo Dark Horizontal 900x350.png'

interface OPTechProcessTableProps {
    className?: string
    children?: ReactNode
}


export const OPTechProcessTable = memo((props: OPTechProcessTableProps) => {
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
                    <th>№</th>
                    <th>Изображение</th>
                    <th>Название</th>
                    <th>Выбрать</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1</td>
                    <td>
                        <img src={test_img} alt="Полный. Пила и лазер в сборку" style={{maxWidth: "250px", maxHeight: "250px"}}/>
                    </td>
                    <td>Полный. Пила и лазер в сборку.</td>
                    <td>
                        <Button type={'button'} variant={'success'}>Выбрать</Button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>
                        <img src={test_img} alt="Полный. Пила и лазер в сборку" style={{maxWidth: "250px", maxHeight: "250px"}}/>
                    </td>
                    <td>Полный. Пила в лазер.</td>
                    <td>
                        <Button type={'button'} variant={'success'}>Выбрать</Button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>
                        <img src={test_img} alt="Полный. Пила и лазер в сборку" style={{maxWidth: "250px", maxHeight: "250px"}}/>
                    </td>
                    <td>Полный. Пила в лазер.</td>
                    <td>
                        <Button type={'button'} variant={'success'}>Выбрать</Button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>
                        <img src={test_img} alt="Полный. Пила и лазер в сборку" style={{maxWidth: "250px", maxHeight: "250px"}}/>
                    </td>
                    <td>Полный. Пила в лазер.</td>
                    <td>
                        <Button type={'button'} variant={'success'}>Выбрать</Button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>
                        <img src={test_img} alt="Полный. Пила и лазер в сборку" style={{maxWidth: "250px", maxHeight: "250px"}}/>
                    </td>
                    <td>Полный. Пила в лазер.</td>
                    <td>
                        <Button type={'button'} variant={'success'}>Выбрать</Button>
                    </td>
                </tr>
                </tbody>
            </Table>
        </div>
    );
});