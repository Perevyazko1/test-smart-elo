import {Button, Form, Table} from "react-bootstrap";

import exampleImg from './Example.png';
import {ProgressItem} from "@pages/SpecificationPage/ui/ProgressItem";

export const OrderProductInfo = (props: { number: number }) => {

    return (
        <Table striped bordered hover size="sm">
            <thead>
            <tr>
                <th>80 шт</th>
                <th colSpan={3}>Кресло B&B Febo Armchair Maxalto /FP/ Изделие №663 (28)</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td rowSpan={7}>
                    <b>№ {props.number}</b>

                </td>
                <td rowSpan={7}>
                    <img src={exampleImg} alt={'product'}/>
                </td>
                <td><b>Столярка</b></td>
                <td><ProgressItem dangerCount={15} secondaryCount={10} successCount={50}/></td>
            </tr>

            <tr>
                <td><b>Малярка</b></td>
                <td><ProgressItem dangerCount={5} secondaryCount={20} successCount={40}/></td>
            </tr>
            <tr>
                <td><b>Крой</b></td>
                <td><ProgressItem dangerCount={4} secondaryCount={10} successCount={12}/></td>
            </tr>
            <tr>
                <td><b>Пошив</b></td>
                <td><ProgressItem dangerCount={12} secondaryCount={10} successCount={12}/></td>
            </tr>
            <tr>
                <td><b>ППУ</b></td>
                <td><ProgressItem dangerCount={5} secondaryCount={10} successCount={12}/></td>
            </tr>
            <tr>
                <td><b>Обивка</b></td>
                <td><ProgressItem dangerCount={0} secondaryCount={50} successCount={0}/></td>
            </tr>
            <tr>
                <td><b>Упаковка</b></td>
                <td><ProgressItem dangerCount={0} secondaryCount={50} successCount={0}/></td>
            </tr>
            <tr>
                <td></td>
                <td>Комментарий к изделию</td>
                <td colSpan={2}>
                    <Form.Control
                        as="textarea"
                        placeholder="Текст задачи"
                        style={{height: `auto`}}
                        value={'Цвет ножек выкрас черный бук! Делаем побыстрей, уедет в субботу!'}
                        className={'mb-1'}
                    />
                    <Button size={"sm"}>
                        Оставить комментарий
                    </Button>
                    <hr className={'m-1 p-0'}/>
                    <p className={'m-1 p-0'}>
                        Елена Стенина 22.04: Заказ зашел, берем в работу!
                    </p>
                    <hr className={'m-1 p-0'}/>
                </td>
            </tr>
            </tbody>
        </Table>
    );
};
