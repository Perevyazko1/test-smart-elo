import type {IPlanDataRow} from "@/entities/plan";
import {CreateShipmentItem} from "@/widgets/shipment/ui/CreateShipmentItem.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {toast} from "sonner";
import {authService} from "@/pages/login/model/api.ts";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";
import {$axios} from "@/shared/api";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

interface IProps {
    items: IPlanDataRow[];
}

export function CreateShipment(props: IProps) {
    const {items} = props;
    let navigate = useNavigate();
    const [date, setDate] = useState<string>();
    const [comment, setComment] = useState<string>();

    const createShipment = () => {
        toast.promise($axios.post<{result: string}>('/shipment/create_shipment/', {
            positions: items.map(item => ({
                series_id: item.series_id,
                quantity: item.quantity,
            })),
            plan_date: date?.slice(),
            comment,
        }), {
            loading: 'Создание отгрузки',
            success: (data) => {
                if (data.data.result === 'OK') {
                    navigate('/shipment')
                    return `Отгрузка на ${date} создана!`;
                } else {
                    return `Ошибка создания отгрузки. Проверьте поля либо обратитесь к администратору.`
                }
            },
            error: 'Ошибка создания отгрузки. Проверьте поля либо обратитесь к администратору.',
        });
    }

    return (
        <div className={'flex flex-col gap-3 bg-white p-5'}>
            <div>
                <div>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value)
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

            <div>
                <input
                    className={'text-xs border-1 border-black p-1 w-full mb-1'}
                    value={comment}
                    placeholder={'Комментарий'}
                    onChange={(e) => {
                        setComment(e.target.value)
                    }}
                    type="text"
                />
            </div>

            <Btn
                className={'border-2 border-black p-1 px-3'}
                onClick={createShipment}
            >
                Создать отгрузку
            </Btn>
        </div>
    );
}