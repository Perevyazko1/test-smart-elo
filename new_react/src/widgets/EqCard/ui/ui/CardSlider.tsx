import React, {useMemo} from "react";

import {EqOrderProduct} from "@widgets/EqCardList";
import {AppSlider} from "@shared/ui";
import {useAppModal, useCompactMode, useCurrentUser} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {createEqImageUrls} from "../../model/lib/createEqImageUrls";


interface CardSliderProps {
    card: EqOrderProduct;
}

export const CardSlider = (props: CardSliderProps) => {
    const {card} = props;
    const {isCompactMode} = useCompactMode();
    const {currentUser} = useCurrentUser();
    const {handleOpen} = useAppModal();

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
             onClick={() => sliderImages.thumbnails.length > 0 && handleOpen(
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
                bgColor={card.card_info.tariff
                    ? " bg-light"
                    : card.card_info.proposed_tariff
                        ? " bg-warning"
                        : " bg-danger"
                }
                price={currentUser.current_department?.piecework_wages
                    ?
                    card.card_info.tariff
                        ? card.card_info.tariff
                        : card.card_info.proposed_tariff
                            ? card.card_info.proposed_tariff
                            : 0
                    : undefined}
                // date={card.order.planned_date?.slice(-5)}
            />
        </div>
    );
}