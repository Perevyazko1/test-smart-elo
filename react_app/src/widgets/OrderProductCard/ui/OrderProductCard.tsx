import {memo} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Slider} from "shared/ui/Slider/Slider";
import {order_product} from "entities/OrderProduct/model/types/orderProduct";

import {CardContentWrapper} from "./CardContentWrapper/CardContentWrapper";
import cls from './OrderProductCard.module.scss'

export enum CardType {
    AWAIT_CARD = 'await',
    IN_WORK_CARD = 'in_work',
    READY_CARD = 'ready',
}

interface OrderProductCardProps {
    card_type: CardType
    order_product: order_product
    className?: string
}

export const OrderProductCard = memo((props: OrderProductCardProps) => {
    const {card_type, className, order_product, ...otherProps} = props

    const getSliderImages = () => {
        const result = []
        order_product.product.product_pictures?.map((product_picture) => (
            result.push(product_picture.image)
        ))
        order_product.main_fabric && result.push(order_product.main_fabric?.image);
        order_product.second_fabric && result.push(order_product.second_fabric?.image);
        order_product.third_fabric && result.push(order_product.third_fabric?.image);
        return result
    }

    const getButtonIcon = (first: boolean = true) => {
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

    const getButtonBg = (first: boolean = true) => {
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

    const mods: Mods = {
        [cls.card_active]: order_product.assignments.length > 0,
        [cls.card_disabled]: order_product.assignments.length === 0
    };

    return (
        <div
            className={classNames('card bg-dark my-1 p-1', mods, [className])}
            {...otherProps}
        >
            <div
                className="card-body d-flex m-0 p-0"
                style={{borderRadius: "6px"}}
            >
                <CardContentWrapper width={"50px"} className={'me-1'}>
                    <button
                        className={getButtonBg() + " btn link-dark border rounded border-2 border-dark d-flex justify-content-xl-center align-items-xl-center"}
                        type="button" style={{width: "39px", height: "90px"}}
                    >
                        {getButtonIcon()}
                    </button>
                </CardContentWrapper>


                <CardContentWrapper width={"100px"} className={'me-1'}>
                    <Slider price={order_product.tax} images={getSliderImages()}/>
                </CardContentWrapper>

                <CardContentWrapper width={"90px"} className={'me-1'}>
                    <h1 className="fw-bold m-0 p-0 pb-1" style={{fontSize: "12px"}}>
                        Всего:{order_product.count_all}
                    </h1>
                    <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                    <h1 className="fw-bold m-0 p-0 py-1" style={{fontSize: "12px"}}>
                        В раб:{order_product.count_in_work}
                    </h1>
                    <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                    <h1 className="fw-bold m-0 p-0 py-1" style={{fontSize: "12px"}}>
                        Своб:{order_product.count_await}
                    </h1>
                    <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                    <h1 className="fw-bold m-0 p-0 pt-1" style={{fontSize: "12px"}}>
                        Готово:{order_product.count_ready}
                    </h1>
                </CardContentWrapper>

                <CardContentWrapper flexFill>
                    <div style={{height: "50%"}}>
                        <h1 className="fs-6 fw-bold h-100 m-0 p-0" style={{overflow: "auto", overflowY: "auto"}}>
                            {order_product.product.name}
                        </h1>
                        <hr className="m-0 p-0" style={{color: "var(--bs-black)"}}/>
                    </div>

                    <div className="d-flex" style={{height: "55%"}}>
                        <div
                            className="d-flex w-50 h-100 m-0 p-0 align-items-center"
                            style={{overflow: "auto", overflowY: "hidden", borderRightStyle: "ridge"}}
                        >
                            {order_product.assignments?.map((assignment) => (
                                <div key={assignment.number}>
                                    {assignment.status === card_type &&
                                        <button
                                            className={`btn btn-primary me-1`}
                                            type="button"
                                        >
                                            {assignment.number}
                                        </button>
                                    }
                                </div>
                            ))}
                        </div>

                        <div
                            className="d-xl-flex align-items-top w-50 pt-1"
                            style={{overflow: "auto", overflowY: "auto", overflowX: "hidden"}}
                        >
                            <div className="fw-bold text-center m-0 p-0"
                                 style={{width: "85px", fontSize: "14px"}}
                            >
                                Заказ: {order_product.series_id}
                            </div>
                            <div
                                className="fw-bold text-center m-0 p-0"
                                style={{overflow: "auto", overflowY: "auto", overflowX: "hidden", fontSize: "14px"}}
                            >
                                {order_product.order.project}
                            </div>
                        </div>

                    </div>
                </CardContentWrapper>

                {card_type !== CardType.AWAIT_CARD &&
                    <CardContentWrapper width={"50px"} className={"ms-1"}>
                        <button
                            className={getButtonBg(false) + " btn link-dark border rounded border-2 border-dark d-flex justify-content-xl-center align-items-xl-center"}
                            type="button" style={{width: "39px", height: "90px"}}
                        >
                            {getButtonIcon(false)}
                        </button>
                    </CardContentWrapper>
                }
            </div>
        </div>
    );
});