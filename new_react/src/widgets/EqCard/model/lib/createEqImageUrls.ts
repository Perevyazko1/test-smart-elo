import {EqOrderProduct} from "@widgets/EqCardList";


export const createEqImageUrls = (card: EqOrderProduct): {images: string[], thumbnails: string[]} => {
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

    card.main_fabric?.fabric_pictures?.forEach((picture) => {
        if (picture.image) {
            imagesSet.add(picture.image);
        }
        if (picture.thumbnail) {
            thumbnailsSet.add(picture.thumbnail);
        }
    });
    card.second_fabric?.fabric_pictures?.forEach((picture) => {
        if (picture.image) {
            imagesSet.add(picture.image);
        }
        if (picture.thumbnail) {
            thumbnailsSet.add(picture.thumbnail);
        }
    });
    card.third_fabric?.fabric_pictures?.forEach((picture) => {
        if (picture.image) {
            imagesSet.add(picture.image);
        }
        if (picture.thumbnail) {
            thumbnailsSet.add(picture.thumbnail);
        }
    });

    return {
        images: Array.from(imagesSet),
        thumbnails: Array.from(thumbnailsSet),
    };
}