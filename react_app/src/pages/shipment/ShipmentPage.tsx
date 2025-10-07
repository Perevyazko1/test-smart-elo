import {ShipmentCard} from "@/widgets/shipment/page/ShipmentCard.tsx";

interface IProps {

}

export function ShipmentPage(props: IProps) {
    const {} = props;

    return (
        <div className={'p-5 flex flex-col gap-5'}>
            <div className={'border-5 border-ridge border-yellow-500 p-3 text-2xl bg-gray-300 flex flex-col gap-4'}>
                <div className={'border-5 border-ridge border-yellow-500 p-3 text-2xl bg-yellow-200'}>
                    <b>Эта неделя</b>
                </div>

                <div className={'bg-gray-300 flex gap-6 flex-wrap'}>
                    <ShipmentCard/>
                    <ShipmentCard/>
                    <ShipmentCard/>
                    <ShipmentCard/>
                </div>
            </div>

            <div className={'border-5 border-ridge border-yellow-500 p-3 text-2xl bg-gray-300 flex flex-col gap-4'}>
                <div className={'border-5 border-ridge border-yellow-500 p-3 text-2xl bg-cyan-700'}>
                    Последующие
                </div>

                <div className={'bg-gray-400 flex gap-6 flex-wrap'}>
                    <ShipmentCard/>
                    <ShipmentCard/>
                    <ShipmentCard/>
                </div>
            </div>
        </div>
    );
}