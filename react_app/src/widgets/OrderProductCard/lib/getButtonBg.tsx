import {CardType} from "../ui/OrderProductCard";
import {order_product} from "entities/OrderProduct";

export const getButtonBg = (first: boolean, card_type: CardType, order_product: order_product) => {
        if (card_type === CardType.AWAIT_CARD || (card_type === CardType.IN_WORK_CARD && !first)) {
            switch (order_product.urgency) {
                case 1:
                    return "btn-danger"
                case 2:
                    return "btn-warning"
                case 3:
                    return "btn-success"
                case 4:
                    return "btn-secondary"
                default:
                    return "btn-success"
            }
        }
        return "btn-success"
    }