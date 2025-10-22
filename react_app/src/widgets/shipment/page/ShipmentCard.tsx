import {ShipmentCardImage} from "@/widgets/shipment/page/ShipmentCardImage.tsx";
import type {IShipment} from "@/entities/shipment";
import {formatDate} from "date-fns";
import {Link} from "react-router-dom";


interface IProps {
    item: IShipment;
}


export function ShipmentCard(props: IProps) {
    const {item} = props;

    return (
        <Link
            to={`/shipment/${item.id}`}
            className={'flex-1 mim-w-100 h-70 bg-gray-500 p-3 border-5 border-ridge border-gray-700 gap-1 flex flex-col justify-between'}>
            <div>
                <b>
                    {item.plan_date ? formatDate(item.plan_date, "dd.MM.yyyy HH:mm") : "Без даты"}
                </b>
            </div>
            <div className={'text-nowrap overflow-x-auto'}>
                Отгрузка №{item.id} - {item.rows[0].order_product?.order?.agent?.tags[0]?.name}
            </div>
            <div>
                <b>{
                    item.status === "new" ? "Новая"
                        : item.status === "in_progress" ? "В процессе"
                            : item.status === "completed" ? "Завершена"
                                : "Неизвестна"
                }</b>
            </div>
            <div className={'flex gap-2 overflow-x-auto'}>
                {item.rows.map((row, index) => (
                    <ShipmentCardImage
                        key={index}
                        row={row}
                    />
                ))}
            </div>
        </Link>
    );
}