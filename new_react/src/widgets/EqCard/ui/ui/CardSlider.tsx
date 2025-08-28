import React, {useMemo} from "react";

import {EqOrderProduct, ListTypes} from "@widgets/EqCardList";
import {AppSlider} from "@shared/ui";
import {useAppModal, useCurrentUser, usePermission} from "@shared/hooks";

import cls from "./EqCard.module.scss";

import {createEqImageUrls} from "../../model/lib/createEqImageUrls";
import {APP_PERM, STATIC_URL} from "@shared/consts";


interface CardSliderProps {
    targetUserId: number | undefined;
    card: EqOrderProduct;
    cardType: ListTypes,
}

export const CardSlider = (props: CardSliderProps) => {
    const {card, cardType, targetUserId} = props;
    const {currentUser} = useCurrentUser();
    const {handleOpen} = useAppModal();

    const bossBerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);

    const showPrice = useMemo(() => {
        return currentUser.current_department?.piecework_wages && (
            currentUser.piecework_wages || bossBerm
        )
    }, [bossBerm, currentUser.current_department?.piecework_wages, currentUser.piecework_wages])

    const totalCount = useMemo(() => {
        let total = 0;
        card.assignments.forEach(item =>
            item.executor === targetUserId ?
                item.amount ?
                    total += item.amount
                    : null
                : item.co_executors?.forEach(co_executor =>
                    co_executor.co_executor === targetUserId ? total += co_executor.amount : null
                )
        )
        return total;
    }, [card.assignments, targetUserId]);

    const sliderImages = createEqImageUrls(card);

    const targetPicture = card.main_fabric?.fabric_pictures ?
        card.main_fabric.fabric_pictures[0] : null

    return (
        <>
            <div className={cls.sliderBlock + ' bg-light rounded'} style={{
                width: 72,
                minWidth: 72,
                maxWidth: 72,
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
                    bgColor={card.card_info.tariff !== null
                        ? " bg-light"
                        : card.card_info.proposed_tariff !== null
                            ? " bg-warning"
                            : " bg-danger"
                    }
                    price={showPrice
                        ?
                        card.card_info.tariff
                            ? card.card_info.tariff
                            : (card.card_info.proposed_tariff && bossBerm)
                                ? card.card_info.proposed_tariff
                                : 0
                        : undefined}
                    totalPrice={showPrice ? cardType !== 'await' ? totalCount : 0 : 0}
                />
            </div>


            <div className={cls.sliderBlock + ' bg-light rounded position-relative'} style={{
                width: 50,
                minWidth: 50,
                maxWidth: 50,
                overflow: 'hidden',
                textShadow: '#ffffff 0 0 2px',

            }}
                 onClick={() => sliderImages.thumbnails.length > 0 && handleOpen(
                     <AppSlider
                         images={sliderImages.images}
                         width={'90vw'}
                         height={'90vh'}
                     />
                 )}
            >
                {targetPicture && (
                    <img
                        src={targetPicture.image?.startsWith("http") || targetPicture.image?.startsWith("blob") ? targetPicture.image : STATIC_URL + targetPicture.image}
                        style={{
                            maxHeight: '100%',
                        }}
                        className="rounded m-0 p-0"
                        alt={"Slide"}
                        loading={"lazy"}
                    />
                )}
                <span
                    className={'position-absolute bottom-0 start-0 text-center fw-bold pt-1'}
                    style={{
                        fontSize: 8,
                        lineHeight: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        wordBreak: 'break-all'
                    }}
                >
                    {card.main_fabric?.name}
                </span>
            </div>

        </>
    );
}
