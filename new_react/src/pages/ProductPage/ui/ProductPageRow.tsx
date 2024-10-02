import {AppSlider} from "@shared/ui";
import React from "react";
import {Link} from "react-router-dom";

import {Product} from "@entities/Product";
import {useAppModal, useEmployeeName, useProductPictures} from "@shared/hooks";


interface ProductPageRowProps {
    product: Product;
}

export const ProductPageRow = (props: ProductPageRowProps) => {
    const {product} = props;
    const {handleOpen} = useAppModal();
    const {getNameById} = useEmployeeName();

    const {thumbnails, images} = useProductPictures(product);

    return (
        <tr key={product.id}>
            <td onClick={() => {
                handleOpen(
                    <AppSlider
                        images={images}
                        width={'90dvw'}
                        height={'90dvh'}
                    />
                )
            }}>
                <AppSlider
                    images={thumbnails}
                    width={'70px'}
                    height={'70px'}
                />
            </td>
            <td>
                <Link to={`/product/${product.id}`}>
                    {product.name}
                </Link>
            </td>
            <td>{product.technological_process?.name || ''}</td>
            <td>
                {getNameById(product.technological_process_confirmed, 'listNameInitials')}
            </td>
        </tr>
    );
};
