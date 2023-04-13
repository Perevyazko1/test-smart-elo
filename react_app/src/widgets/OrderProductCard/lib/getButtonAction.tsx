import {Actions} from "../model/services/fetchUpdateAssignments";
import {CardType} from "../ui/OrderProductCard";

export const getButtonAction = (first: boolean, card_type: CardType) => {
        if (card_type === CardType.AWAIT_CARD) {
            return Actions.AWAIT_TO_IN_WORK
        } else if (card_type === CardType.IN_WORK_CARD && first) {
            return Actions.IN_WORK_TO_READY
        } else if (card_type === CardType.IN_WORK_CARD && !first) {
            return Actions.IN_WORK_TO_AWAIT
        } else if (card_type === CardType.READY_CARD && first) {
            return Actions.CONFIRMED
        } else if (card_type === CardType.READY_CARD && !first) {
            return Actions.READY_TO_IN_WORK
        } else new Error('Неопознанный action')
    }