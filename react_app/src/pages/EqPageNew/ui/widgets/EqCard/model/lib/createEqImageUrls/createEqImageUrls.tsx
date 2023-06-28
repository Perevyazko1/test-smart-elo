import {eq_card} from "entities/EqPageCard";

export const createEqImageUrls = (order_product: eq_card) => {
    const imageSet = new Set<string>()

    order_product.product.product_pictures?.map((product_picture) => (
        product_picture.image && imageSet.add(product_picture.image)
    ))

    order_product.main_fabric?.image && imageSet.add(order_product.main_fabric?.image);
    order_product.second_fabric?.image && imageSet.add(order_product.second_fabric?.image);
    order_product.third_fabric?.image && imageSet.add(order_product.third_fabric?.image);

    return Array.from(imageSet)
}