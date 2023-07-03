import React, {memo, useState} from 'react';

import {OpModal} from "features/OpInfo";
import {eq_card} from "entities/EqPageCard";
import {classNames} from "shared/lib/classNames/classNames";
import {IndicatorWrapper} from "shared/ui/IndicatorWrapper/IndicatorWrapper";

import cls from './EqCardCounts.module.scss';

interface EqCardCountsProps {
    eqCard: eq_card;
    className?: string;
}


export const EqCardCounts = memo((props: EqCardCountsProps) => {
    const {
        eqCard,
        className,
    } = props
    const [showCardInfo, setShowCardInfo] = useState(false)

    return (
        <IndicatorWrapper indicator={'tech-process'}
                          show={!eqCard?.product?.technological_process}
                          className={'bg-danger'}
        >

            {showCardInfo && <OpModal onHide={() => setShowCardInfo(false)} eqCard={eqCard}/>}

            <div
                className={classNames(cls.cardCounts, {}, ['fs-7', className])}
                onClick={() => setShowCardInfo(true)}
            >
                <div className={eqCard.card_info.count_all === 0 ? 'text-muted' : ''}>
                    Всего:{eqCard.card_info.count_all}
                </div>
                <hr className={cls.contentHr}/>
                <div className={eqCard.card_info.count_in_work === 0 ? 'text-muted' : ''}>
                    В_раб:{eqCard.card_info.count_in_work}
                </div>
                <hr className={cls.contentHr}/>

                <div className={eqCard.card_info.count_await === 0 ? 'text-muted' : ''}>
                    Своб:{eqCard.card_info.count_await}
                </div>
                <hr className={cls.contentHr}/>

                <div className={eqCard.card_info.count_ready === 0 ? 'text-muted' : ''}>
                    Готов:{eqCard.card_info.count_ready}
                </div>
            </div>
        </IndicatorWrapper>
    );
});