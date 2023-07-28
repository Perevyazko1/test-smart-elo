import {useCallback} from "react";
import {product} from "entities/Product";

export const useProductPictures = (product: product | null) => {
    const urls = useCallback(() => {
        const imageSet = new Set<string>()
        product?.product_pictures?.map((product_picture) => (
            product_picture.image && imageSet.add(product_picture.image)
        ))
        return Array.from(imageSet)
    }, [product?.product_pictures])

    return urls();
}