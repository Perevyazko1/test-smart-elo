import {OrderDetailWidget} from "@widgets/OrderDetailWidget";
import {useAppModal, useCurrentUser} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {EqCardType} from "../../../model/types/eqCardType";

interface CardOrderProjectProps {
    card: EqCardType;
}

export const CardOrderProject = (props: CardOrderProjectProps) => {
    const {card} = props;

    const {currentUser} = useCurrentUser();
    const {openModal} = useAppModal();

    const onClickHandler = () => {
        openModal(
            <OrderDetailWidget order_id={card.order.id} scrollToId={card.id}/>
        )
    };

    return (
        <div className={cls.orderProjectBlock + ' rounded'}
             onClick={onClickHandler}
             style={{
                 fontSize: '14px',
                 backgroundColor: currentUser.current_department.color || "#ffffff"
             }}
        >
            <div className={'fs-7 fw-bold text-center'}>
                Заказ:
                <br/>
                {card.series_id}
                <hr className={'m-0 p-0'}/>
            </div>
            <div className={'fs-7 text-center'}>
                Проект:
                <br/>
                {card.order.project}
            </div>
        </div>
    );
};
