import {Dispatch} from "@reduxjs/toolkit";

import {eqActions} from "pages/EQPage";

import {order_product} from "entities/OrderProduct";
import {eqAwaitListActions} from "pages/EQPage/model/slice/awaitListSlice";
import {eqInWorkListActions} from "pages/EQPage/model/slice/inWorkListSlice";

import {CardType} from "../ui/OrderProductCard";
import {eqReadyListActions} from "../../../pages/EQPage/model/slice/readyListSlice";

export const updateTargetData = (
    first: boolean, card_type: CardType, dispatch: Dispatch, order_product: order_product
) => {
    if (card_type === CardType.AWAIT_CARD) {
        // TODO переделать сценарии обновления
        dispatch(eqAwaitListActions.addNotRelevantId(order_product.id))
        dispatch(eqInWorkListActions.addNotRelevantId(order_product.id))
        dispatch(eqReadyListActions.addNotRelevantId(order_product.id))
        return;
    } else if (card_type === CardType.IN_WORK_CARD && first) {
        dispatch(eqAwaitListActions.addNotRelevantId(order_product.id))
        dispatch(eqInWorkListActions.addNotRelevantId(order_product.id))
        dispatch(eqReadyListActions.addNotRelevantId(order_product.id))
        return;
    } else if (card_type === CardType.IN_WORK_CARD && !first) {
        dispatch(eqAwaitListActions.addNotRelevantId(order_product.id))
        dispatch(eqInWorkListActions.addNotRelevantId(order_product.id))
        dispatch(eqReadyListActions.addNotRelevantId(order_product.id))
        return;
    } else if (card_type === CardType.READY_CARD && first) {
        dispatch(eqReadyListActions.addNotRelevantId(order_product.id))
        dispatch(eqActions.weekInfoUpdated())
        return;
    } else if (card_type === CardType.READY_CARD && !first) {
        dispatch(eqAwaitListActions.addNotRelevantId(order_product.id))
        dispatch(eqInWorkListActions.addNotRelevantId(order_product.id))
        dispatch(eqReadyListActions.addNotRelevantId(order_product.id))
        return;
    } else new Error('Ошибка обработки обновления списков из карточки')
}