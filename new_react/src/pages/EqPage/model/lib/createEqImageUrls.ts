import {EqCardType} from "../types/eqCardType";

export const createEqImageUrls = (card: EqCardType): {images: string[], thumbnails: string[]} => {
    const imagesSet = new Set<string>();
    const thumbnailsSet = new Set<string>();

    card.product.product_pictures?.forEach((product_picture) => {
        if (product_picture.image) {
            imagesSet.add(product_picture.image);
        }
        if (product_picture.thumbnail) {
            thumbnailsSet.add(product_picture.thumbnail);
        }
    });

    if (card.main_fabric?.image) imagesSet.add(card.main_fabric?.image);
    if (card.main_fabric?.thumbnail) thumbnailsSet.add(card.main_fabric?.thumbnail);

    if (card.second_fabric?.image) imagesSet.add(card.second_fabric?.image);
    if (card.second_fabric?.thumbnail) thumbnailsSet.add(card.second_fabric?.thumbnail);

    if (card.third_fabric?.image) imagesSet.add(card.third_fabric?.image);
    if (card.third_fabric?.thumbnail) thumbnailsSet.add(card.third_fabric?.thumbnail);

    return {
        images: Array.from(imagesSet),
        thumbnails: Array.from(thumbnailsSet),
    };
}