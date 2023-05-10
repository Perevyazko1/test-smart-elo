import {Dispatch} from "@reduxjs/toolkit";

import {eqActions} from "pages/EQPage";

import {CardType} from "../ui/OrderProductCard";

export const updateTargetList = (first: boolean, card_type: CardType, dispatch: Dispatch) => {
    if (card_type === CardType.AWAIT_CARD) {
        dispatch(eqActions.inWorkListUpdated())
        dispatch(eqActions.awaitListUpdated())
        return;
    } else if (card_type === CardType.IN_WORK_CARD && first) {
        dispatch(eqActions.eqUpdated())
        return;
    } else if (card_type === CardType.IN_WORK_CARD && !first) {
        dispatch(eqActions.inWorkListUpdated())
        dispatch(eqActions.awaitListUpdated())
        return;
    } else if (card_type === CardType.READY_CARD && first) {
        dispatch(eqActions.readyListUpdated())
        dispatch(eqActions.weekInfoUpdated())
        return;
    } else if (card_type === CardType.READY_CARD && !first) {
        dispatch(eqActions.eqUpdated())
        return;
    } else new Error('Ошибка обработки обновления списков из карточки')
}