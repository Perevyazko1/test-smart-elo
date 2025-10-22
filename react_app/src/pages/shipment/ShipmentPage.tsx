import {ShipmentCard} from "@/widgets/shipment/page/ShipmentCard.tsx";
import {$axios} from "@/shared/api";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import type {IShipment} from "@/entities/shipment";

interface IProps {

}

export function ShipmentPage(props: IProps) {
    const {} = props;
    const [shipments, setShipments] = useState<IShipment[]>([]);

    useEffect(() => {
        toast.promise(
            $axios.get<IShipment[]>('/shipment/items'),
            {
                loading: 'Загрузка отгрузок...',
                success: (response) => {
                    setShipments(response.data);
                    return 'Отгрузки загружены';
                },
                error: 'Ошибка загрузки отгрузок'
            }
        )
    }, [])

    return (
        <div className={'p-5 flex flex-col gap-5 bg-gray-500 min-h-screen'}>
            <div className={'border-5 border-ridge border-yellow-500 p-3 text-2xl bg-gray-300 flex flex-col gap-4'}>
                <div className={'border-5 border-ridge border-yellow-500 p-3 text-2xl bg-yellow-200'}>
                    <b>Ожидание</b>
                </div>

                <div className={'bg-gray-300 flex gap-6 flex-wrap'}>
                    {shipments.map((shipment) => (
                        <ShipmentCard
                            key={shipment.id}
                            item={shipment}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}