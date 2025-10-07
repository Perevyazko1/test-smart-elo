import {ArchiveIcon} from "lucide-react";
import {useShipmentState} from "@/shared/state/shipment/shipmentState.ts";
import {AppModal} from "@/shared/ui/modal/AppModal.tsx";
import {CreateShipment} from "@/widgets/shipment/ui/CreateShipment.tsx";

interface IProps {

}

export function ShipmentWidget(props: IProps) {
    const {} = props;

    const state = useShipmentState(s => s.shipment);

    const count = state.items.map(item => item.quantity).reduce((a, b) => a + b, 0) || 0;

    return (
        <AppModal
            trigger={
                <div className={'text-white relative cursor-pointer hover:scale-105 hover:opacity-100 opacity-85 transition-all duration-100'}>
                    <ArchiveIcon/>
                    {count > 0 && (
                        <span
                            className={'absolute rounded-full bg-red-500 text-white text-[.4em] px-[1em] py-[.5em] bottom-0 -left-4'}>
                            {count}
                        </span>
                    )}
                </div>
            }

            content={
                <CreateShipment items={state.items}/>
            }

            title={"Создание отгрузки"}
            description={"Проверьте количество позиций, дату отгрузки и нажмите Подтвердить"}
        />
    );
}