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

    return (
        <div
            className={
            cls.cardCounts
                + ' fs-7 fw-bold rounded'
                + (card.card_info.count_ready < card.shipped ? " bg-warning" : " bg-white")
        }
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
                    top={`${!!card.order.comment_base || !!card.order.comment_case ?  3 : -3}px`}
                >
                    <div className={
                        (card.card_info.count_all === 0 ? 'text-muted ' : '' ) + cls.infoItem
                    }
                    >
                        <span>Всего:</span>
                        <span>{card.card_info.count_all}</span>

                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={
                        (card.card_info.count_in_work === 0 ? 'text-muted ' : '') + cls.infoItem
                    }>
                        <span>В раб:</span>
                        <span>{card.card_info.count_in_work}</span>
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={
                        (card.card_info.count_await === 0 ? 'text-muted ' : '') + cls.infoItem
                    }>
                        <span>Отгр.:</span>
                        <span>{card.shipped}</span>
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={
                        (card.card_info.count_ready === 0 ? 'text-muted ' : '') + cls.infoItem
                    }>
                        <span>Готов:</span>
                        <span>{card.card_info.count_ready}</span>
                    </div>
                </IndicatorWrapper>
            </IndicatorWrapper>
        </div>
    );
};
