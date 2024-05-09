import React, {useMemo} from "react";


import {AppSlider} from "@shared/ui";
import {useAppModal, useCompactMode, useCurrentUser} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {createEqImageUrls} from "../../../model/lib/createEqImageUrls";
import {EqCardType} from "../../../model/types/eqCardType";


interface CardSliderProps {
    card: EqCardType;
}

export const CardSlider = (props: CardSliderProps) => {
    const {card} = props;
    const {isCompactMode} = useCompactMode();
    const {currentUser} = useCurrentUser();
    const {openModal} = useAppModal();

    const sliderWidth = useMemo(() => {
        if (isCompactMode) {
            return '72px';
        } else {
            return '100px';
        }
    }, [isCompactMode]);


    const sliderImages = createEqImageUrls(card);

    return (
        <div className={cls.sliderBlock + ' bg-light rounded'} style={{
            width: sliderWidth,
            minWidth: sliderWidth,
            maxWidth: sliderWidth,
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
                price={currentUser.current_department.piecework_wages ? card.card_info.tariff : undefined}
                date={card.order.planned_date?.slice(-5)}
            />
        </div>
    );
};
