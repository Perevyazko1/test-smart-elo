import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {IShipment} from "@/entities/shipment";
import {toast} from "sonner";
import {$axios} from "@/shared/api";
import {formatDate} from "date-fns";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";

interface IProps {

}

export function ShipmentDetailPage(props: IProps) {
    const {} = props;
    const {shipmentId} = useParams();

    const [shipment, setShipment] = useState<IShipment>();

    useEffect(() => {
        toast.promise(
            $axios.get<IShipment>(`/shipment/items/${shipmentId}`),
            {
                loading: 'Загрузка отгрузки...',
                success: (response) => {
                    setShipment(response.data);
                    return 'Отгрузка загружена';
                },
                error: 'Ошибка загрузки отгрузки'
            }
        )
    }, [])

    if (!shipmentId || isNaN(Number(shipmentId))) {
        return <div>Invalid shipment ID provided</div>;
    }

    return (
        <div className={'p-5 flex flex-col gap-5 bg-gray-500 min-h-screen'}>
            <div className={'bg-yellow-100 p-5 flex flex-col gap-4'}>
                <h2 className={'text-2xl font-bold'}>Отгрузка № {shipmentId}</h2>

                {shipment && (
                    <>
                        <div className={'flex gap-2'}>
                            <span>Плановая дата: </span>
                            <span>
                    {shipment.plan_date ? formatDate(shipment.plan_date, "dd.MM.yyyy HH:mm") : 'Без плановой даты'}

                    </span>
                        </div>
                        <div className={'flex flex-col gap-2'}>
                            <span>Комментарий: </span>
                            <span>{shipment.comment}</span>
                        </div>

                        <div className={'bg-yellow-50 p-3 flex flex-col gap-2'}>
                            <span>Позиции</span>

                            <table className={'w-full'}>
                                <thead>
                                <tr>
                                    <th>Заказ</th>
                                    <th>Проект</th>
                                    <th>Название</th>
                                    <th>Изделие</th>
                                    <th>Ткань</th>
                                    <th>Ткань</th>
                                    <th>Количество</th>
                                    <th>Управление</th>
                                </tr>
                                </thead>

                                <tbody>
                                {shipment.rows?.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.order_product.series_id}</td>
                                        <td>{row.order_product.order.project}</td>
                                        <td>{row.order_product.product.name}</td>
                                        <td className={'p-1'}>
                                            <img
                                                src={STATIC_URL + row.order_product.product.product_pictures[0].thumbnail}
                                                alt={row.order_product.product.name}
                                                className={'size-20 object-fit-cover'}
                                            />
                                        </td>
                                        <td>{row.order_product.main_fabric?.name}</td>
                                        <td className={'p-1'}>
                                            {row.order_product.main_fabric && (
                                                <img
                                                    src={STATIC_URL + row.order_product.main_fabric.fabric_pictures[0].thumbnail}
                                                    alt={row.order_product.main_fabric.name}
                                                    className={'size-20 object-fill'}
                                                />
                                            )}
                                        </td>
                                        <td>{row.quantity} ед.</td>
                                        <td>
                                            <Btn>
                                                🖨️
                                            </Btn>

                                            <Btn>
                                                Резерв
                                            </Btn>
                                        </td>
                                    </tr>
                                ))}

                                </tbody>

                            </table>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}