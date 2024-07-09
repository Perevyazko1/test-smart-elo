import {OrderDetailWidget} from "@widgets/OrderDetailWidget";
import {useAppModal, useCurrentUser} from "@shared/hooks";

import cls from "./EqCard.module.scss";
import {EqOrderProduct} from "@pages/EqPage/model/types";


interface CardOrderProjectProps {
    card: EqOrderProduct;
}

export const CardOrderProject = (props: CardOrderProjectProps) => {
    const {card} = props;

    const {currentUser} = useCurrentUser();
    const {openModal} = useAppModal();

    const onClickHandler = () => {
        openModal({
                content: (
                    <OrderDetailWidget order_id={card.order.id} scrollToId={card.id}/>
                )
            }
        )
    };

    return (
        <div className={cls.orderProjectBlock + ' rounded'}
             onClick={onClickHandler}
             style={{
                 lineHeight: '16px',
                 backgroundColor: currentUser.current_department?.color || "#ffffff"
             }}
        >
            <div className={'fs-7 fw-bold text-nowrap'}>
                {card.series_id}
            </div>
            <hr className={'m-0 p-0'}/>
            <div className={'fs-7 text-nowrap'}>
                {card.order.inner_number || "-"}
            </div>
            <hr className={'m-0 p-0'}/>
            <div className={'fs-7 text-nowrap'}>
                Проект:
                <br/>
                {card.order.project || '-'}
            </div>
        </div>
    );
};
