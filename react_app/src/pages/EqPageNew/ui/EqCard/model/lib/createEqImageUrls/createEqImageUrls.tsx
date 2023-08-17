import {eq_card} from "entities/EqPageCard";

export const createEqImageUrls = (order_product: eq_card): {images: string[], thumbnails: string[]} => {
    const imagesSet = new Set<string>();
    const thumbnailsSet = new Set<string>();

    order_product.product.product_pictures?.forEach((product_picture) => {
        if (product_picture.image) {
            imagesSet.add(product_picture.image);
        }
        if (product_picture.thumbnail) {
            thumbnailsSet.add(product_picture.thumbnail);
        }
    });

    if (order_product.main_fabric?.image) imagesSet.add(order_product.main_fabric?.image);
    if (order_product.main_fabric?.thumbnail) thumbnailsSet.add(order_product.main_fabric?.thumbnail);

    if (order_product.second_fabric?.image) imagesSet.add(order_product.second_fabric?.image);
    if (order_product.second_fabric?.thumbnail) thumbnailsSet.add(order_product.second_fabric?.thumbnail);

    if (order_product.third_fabric?.image) imagesSet.add(order_product.third_fabric?.image);
    if (order_product.third_fabric?.thumbnail) thumbnailsSet.add(order_product.third_fabric?.thumbnail);

    return {
        images: Array.from(imagesSet),
        thumbnails: Array.from(thumbnailsSet),
    };
}