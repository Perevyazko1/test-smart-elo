import type {IPlanDataRow} from "@/entities/plan";
import {CreateShipmentItem} from "@/widgets/shipment/ui/CreateShipmentItem.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";

interface IProps {
    items: IPlanDataRow[];
}

export function CreateShipment(props: IProps) {
    const {items} = props;

    return (
        <div className={'flex flex-col gap-3 bg-white p-5'}>
            <div>
                <div>
                    <input
                        type="date"
                        value={''}
                        onChange={(e) => {
                            console.log(e.target.value)
                        }}
                        className={'text-xs border-1 border-black p-1 w-full mb-1'}
                    />
                </div>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Проект</th>
                    <th>Заказ</th>
                    <th>Изделие</th>
                    <th>Название</th>
                    <th>Ткань</th>
                    <th>Ткань</th>
                    <th>Количество</th>
                    <th>Заказ</th>
                </tr>
                </thead>
                <tbody>
                {items.map(item => (
                    <CreateShipmentItem
                        key={item.series_id}
                        item={item}
                    />
                ))}
                </tbody>
            </table>

            <Btn
                className={'border-2 border-black p-1 px-3'}
            >
                Создать отгрузку
            </Btn>
        </div>
    );
}