import {IndicatorWrapper} from "@shared/ui";
import {useAppDispatch, useAppModal} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {EqInfo, eqPageActions} from "@pages/EqPage";
import {EqOrderProduct} from "@widgets/EqCardList";


interface CardCounterProps {
    card: EqOrderProduct;
}

export const CardCounter = (props: CardCounterProps) => {
    const {card} = props;

    const {handleOpen} = useAppModal();

    const dispatch = useAppDispatch();

    const openModalWithInfo = () => {
        handleOpen(
            <EqInfo card={card} updCallback={
                () => dispatch(eqPageActions.addNotRelevantId(card.id))
            }/>
        )
    };

    const getBgColor = () => {
        if (card.card_info.count_ready < card.shipped) {
            return "#ffc107"
        } else if (card.shipped === card.card_info.count_ready && card.shipped === card.card_info.count_all) {
            return "rgb(197,255,186)"
        } else if (card.card_info.has_extra_info) {
            return "rgb(220,197,255)"
        }
        // else if (card.shipped > card.card_info.count_ready) {
        //     return "rgb(189,245,255)"
        // }
        else {
            return "bg-white"
        }
    }

    return (
        <div
            className={
                cls.cardCounts
                + ' fs-7 fw-bold rounded '
            }
            style={{
                backgroundColor: getBgColor(),
            }}
            onClick={openModalWithInfo}
        >
            <IndicatorWrapper
                indicator={'comment'}
                show={!!card.order.comment_base || !!card.order.comment_case}
                color={' bg-warning'}
                top={`${-3}px`}
            >
                <IndicatorWrapper
                    indicator={'tech-process'}
                    show={!card.product.technological_process}
                    color={' bg-danger'}
                    top={`${!!card.order.comment_base || !!card.order.comment_case ? 3 : -3}px`}
                >
                    <div className={cls.infoItem}>
                        <span>Всего:</span>
                        <span>{card.card_info.count_all}</span>

                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={cls.infoItem}>
                        <span>В раб:</span>
                        <span>{card.card_info.count_in_work}</span>
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={cls.infoItem}>
                        <span>Отгр.:</span>
                        <span>{card.shipped}</span>
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={cls.infoItem}>
                        <span>Готов:</span>
                        <span>{card.card_info.count_ready}</span>
                    </div>
                </IndicatorWrapper>
            </IndicatorWrapper>
        </div>
    );
};
