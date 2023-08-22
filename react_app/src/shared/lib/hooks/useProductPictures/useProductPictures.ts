import {useCallback} from "react";
import {product} from "entities/Product";

export const useProductPictures = (product: product | null): { images: string[], thumbnails: string[] } => {
    const urls = useCallback(() => {
        const imageSet = new Set<string>();
        const thumbnailSet = new Set<string>();
        product?.product_pictures?.forEach((product_picture) => {
            product_picture.image && imageSet.add(product_picture.image)
            product_picture.thumbnail && thumbnailSet.add(product_picture.thumbnail)
        })
        return {images: Array.from(imageSet), thumbnails: Array.from(thumbnailSet)}
    }, [product?.product_pictures])

    return urls();
}