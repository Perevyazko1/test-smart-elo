import {ShipmentCardImage} from "@/widgets/shipment/page/ShipmentCardImage.tsx";

interface IProps {

}

export function ShipmentCard(props: IProps) {
    const {} = props;

    return (
        <div className={'flex-1 mim-w-100 h-70 bg-gray-500 p-3 border-5 border-ridge border-gray-700 gap-1 flex flex-col justify-between'}>
            <div><b>ВТОРНИК 07.ОКТ</b></div>
            <div>Отгрузка №1 - 1МФ</div>
            <div><b>КОМПЛЕКТАЦИЯ</b></div>
            <div className={'flex gap-2 overflow-x-auto'}>
                <ShipmentCardImage/>
                <ShipmentCardImage/>
                <ShipmentCardImage/>
                <ShipmentCardImage/>
            </div>
        </div>
    );
}