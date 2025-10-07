import type {IPlanDataRow} from "@/entities/plan";
import {useState} from "react";
import {STATIC_URL} from "@/shared/consts/serverConfig.ts";

interface IProps {
    item: IPlanDataRow;
}

export function CreateShipmentItem(props: IProps) {
    const {item} = props;

    const [quantity, setQuantity] = useState<number>(item.quantity - item.shipped);

    return (
        <tr>
            <td>{item.project}</td>
            <td>{item.order}</td>
            <td>
                <img
                    loading={'lazy'}
                    src={STATIC_URL + item.product_picture}
                    alt="Chair"
                    className={'object-fill max-h-full max-w-full min-w-[70px]'}
                />
            </td>
            <td>{item.product_name}</td>
            <td>
                {item.fabric_picture && (
                    <img
                        loading={'lazy'}
                        src={STATIC_URL + item.fabric_picture}
                        alt="Chair"
                        className={'object-fill max-h-full max-w-full min-w-[70px]'}
                    />
                )}
            </td>
            <td>{item.fabric_name}</td>
            <td>
                <input
                    type="number"
                    value={quantity}
                    min={0}
                    max={item.quantity}
                    step={1}
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 0) {
                            setQuantity(value);
                        }
                    }}
                    className={'text-xl w-full text-end outline-2 outline-black'}
                />
            </td>
            <td className={'text-nowrap'}>
                {item.series_id}
            </td>
        </tr>
    );
}