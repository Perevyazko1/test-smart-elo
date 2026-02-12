import ImageSrc from "./fabric.jpg";
import {STATIC_URL} from "@shared/consts";
import {IFabric} from "@pages/FabricPage/types";
import {getHumansDatetime} from "@shared/lib";
import {useAppModal} from "@shared/hooks";
import {FabricLossWidget} from "@pages/FabricPage/FabricLossWidget";

interface Props {
    actionName1: string;
    actionName2: string;
    item: IFabric;
    variant: "sklad" | "await" | "stock";
}

export const FabricCard = (props: Props) => {
    const {actionName1, actionName2, item, variant} = props;

    const {handleOpen} = useAppModal();

    return (
        <div className={'card d-flex p-1 flex-row flex-nowrap gap-1'} style={{height: '100px'}}>
            <button
                onClick={() => handleOpen(
                    <FabricLossWidget
                        targetName={item.name}
                        defaultValue={variant === "await" ? item.quantity : item.stock}
                        fabric={item}
                        maxValue={variant === "await" ? item.quantity : item.stock}
                        variant={variant}
                    />
                )}
                className={'appBtn greyBtn'}
                disabled={variant === "sklad"}
            >
                <div>
                    <div>
                        {actionName1}
                    </div>
                    <div>
                        {actionName2}
                    </div>
                </div>
            </button>
            {item.image && (
                <div>
                    <img
                        className={'h-100 w-100'}
                        src={STATIC_URL + item.image}
                        alt={'ИЗОБРАЖЕНИЕ ТКАНИ'}
                        style={{
                            maxWidth: '100px',
                            maxHeight: '100px',
                        }}
                    />
                </div>
            )}
            <div className={'flex-grow-1'}>
                <div>{item.name}</div>
                <div>{item.project}</div>
                <div>{item.agent}</div>
                <div>Заказ {item.order} от {getHumansDatetime(item.moment, "DD-MM")}</div>
            </div>
            <div>
                {variant === "await" && (
                    <>
                        <div>ОЖИД <b>{item.quantity}</b></div>
                        <div>ОСТ <b>{item.stock}</b></div>
                    </>
                )}
                {variant === "sklad" && (
                    <div>КОЛ-ВО <b>{item.quantity}</b></div>
                )}

                {variant === "await" && (
                    <div className={
                        item.payed ?
                            'bg-success-subtle' :
                            'bg-warning-subtle'
                    }>
                        {item.payed ? "ОПЛАЧЕН" : "НЕ ОПЛАЧЕН"}
                    </div>
                )}
            </div>
        </div>
    );
};
