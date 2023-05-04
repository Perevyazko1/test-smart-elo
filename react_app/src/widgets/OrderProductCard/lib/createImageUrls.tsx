import {order_product} from "entities/OrderProduct";

export const createImageUrls = (order_product: order_product) => {
    const result = []

    order_product.product.product_pictures?.map((product_picture) => (
        product_picture.image && result.push(product_picture.image)
    ))

    order_product.main_fabric?.image && result.push(order_product.main_fabric?.image);
    order_product.second_fabric?.image && result.push(order_product.second_fabric?.image);
    order_product.third_fabric?.image && result.push(order_product.third_fabric?.image);

    return result
}