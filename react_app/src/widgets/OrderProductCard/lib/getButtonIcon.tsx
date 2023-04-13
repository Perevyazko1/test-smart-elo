import {CardType} from "../ui/OrderProductCard";

export const getButtonIcon = (first: boolean = true, card_type: CardType) => {
        if (card_type === CardType.AWAIT_CARD) {
            return <i className="fas fa-angle-double-left fs-2"/>
        } else if (card_type === CardType.IN_WORK_CARD && first) {
            return <i className="fas fa-check fs-3"/>
        } else if (card_type === CardType.IN_WORK_CARD && !first) {
            return <i className="fas fa-angle-double-right fs-2"/>
        } else if (card_type === CardType.READY_CARD && first) {
            return <i className="fas fa-check-double fs-3"/>
        } else if (card_type === CardType.READY_CARD && !first) {
            return <i className="fas fa-angle-double-up fs-2"/>
        }
    }