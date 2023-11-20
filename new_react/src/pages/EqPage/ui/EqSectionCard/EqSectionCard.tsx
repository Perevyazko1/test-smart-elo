import React, {HTMLAttributes, memo, useCallback, useContext} from "react";

import cls from "./EqSectionCard.module.scss";

import {AppInCompactMode} from "@app";
import {EqCard} from "@pages/EqPage/model/types/eqCard";
import {EqNumbers} from "@pages/EqPage/ui/EqSectionCard/EqNumbers";
import {useAppModal} from "@shared/hooks";

import {createEqImageUrls} from "../../model/lib/createEqImageUrls";
import {AppSlider} from "@shared/ui/AppSlider/AppSlider";

interface EqSectionCardProps extends HTMLAttributes<HTMLDivElement> {
    card: EqCard;
}

export const EqSectionCard = memo((props: EqSectionCardProps) => {
    const {card, ...otherProps} = props;

    const {openModal} = useAppModal();

    const compactModeContext = useContext(AppInCompactMode);
    if (!compactModeContext) {
        throw new Error("SomeComponent must be used within a AppInCompactMode.Provider");
    }
    const {isCompactMode} = compactModeContext;

    const getSliderWidth = useCallback(() => {
        if (isCompactMode) {
            return '72px';
        } else {
            return '100px';
        }
    }, [isCompactMode]);

    const sliderImages = createEqImageUrls(card);

    return (
        <div className={'mt-1 pb-05'} {...otherProps}>
            <div className={cls.overflowWrapper + ' bg-black rounded rounded-2'}>
                {/*button*/}
                <button className={'appBtn greenBtn p-1 rounded rounded-2 h-100'}>
                    <i className="fas fa-angle-double-left fs-2"/>
                </button>

                {/*slider*/}
                <div className={cls.sliderBlock + ' bg-light rounded'} style={{
                    width: getSliderWidth(),
                    minWidth: getSliderWidth(),
                    maxWidth: getSliderWidth(),
                }}
                     onClick={() => openModal(
                         <AppSlider
                             images={sliderImages.images}
                             width={'90vw'}
                             height={'90vh'}
                         />
                     )}
                >
                    <AppSlider
                        images={sliderImages.thumbnails}
                        width={'100%'}
                        height={'100%'}
                        price={card.tariff?.tariff}
                        date={card.order.planned_date.slice(-5)}
                    />
                </div>

                {/*counts*/}
                <div
                    className={cls.cardCounts + ' fs-7 fw-bold rounded'}
                    onClick={() => openModal(
                        <div>
                            {card.product.name}
                        </div>
                    )}
                >
                    <div>
                        Всего:{card.card_info.count_all}
                    </div>
                    <hr className={cls.contentHr}/>
                    <div>
                        В_раб:{card.card_info.count_in_work}
                    </div>
                    <hr className={cls.contentHr}/>

                    <div>
                        Своб:{card.card_info.count_await}
                    </div>
                    <hr className={cls.contentHr}/>

                    <div className={'text-muted'}>
                        Готов:{card.card_info.count_ready}
                    </div>
                </div>

                {/*Имя и номера бегунков*/}
                <div className={cls.nameNumberBlock + ' bg-light rounded'}>
                    <div className={cls.productName}>
                        {card.product.name}
                    </div>

                    <hr className={'m-0 p-0'}/>

                    <div className={cls.numbersBlock}>
                        <EqNumbers assignments={card.assignments}/>
                    </div>
                </div>

                {/*Заказ-Проект блок*/}
                <div className={cls.orderProjectBlock + ' bg-light rounded'} style={{fontSize: '14px'}}>
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

                <div className={cls.depInfoBlock + ' bg-light rounded fs-7 fw-bold'}>
                    БАА: 12 (0)
                    <hr className={'m-0 p-0'}/>
                    ХДВ: 13 (0)
                    <hr className={'m-0 p-0'}/>
                </div>

                {/*<button className={'appBtn greenBtn p-1 rounded rounded-2 h-100'}>*/}
                {/*    <i className="fas fa-angle-double-left fs-2"/>*/}
                {/*</button>*/}
            </div>
        </div>
    );
});
