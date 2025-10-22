import {STATIC_URL} from "@/shared/consts/serverConfig.ts";
import Chair from "./Chair.jpg";
import type {IShipmentRow} from "@/entities/shipment";

interface IProps {
    row: IShipmentRow;
}

export function ShipmentCardImage(props: IProps) {
    const {row} = props;

    return (
        <div className={'size-25 border-2 border-dashed relative'}>
            <img
                loading={'lazy'}
                src={STATIC_URL + row.order_product.product.product_pictures[0].thumbnail}
                alt="Мебель"
                className={'object-fill max-h-full max-w-full'}
            />
            <div className={'flex justify-evenly bottom-0 absolute w-full'}>
                <span className={'text-red-700 bg-gray-300 px-1'}>
                    <b>0</b>
                </span>
                <span className={'text-green-600 bg-gray-300 px-1'}><b>
                    {row.items.length}
                </b></span>
            </div>
        </div>
    );
}