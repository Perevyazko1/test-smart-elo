import React, {useEffect, useState} from "react";

import {Link, useParams} from "react-router-dom";
import {Container, Table} from "react-bootstrap";

import cls from "./ProductDetailsPage.module.scss";

import {ModalProvider} from "@app";
import {DynamicComponent, ReducersList} from "@features";
import {TechProcessWidget} from "@widgets/TechProcessWidget";
import {AppNavbar} from "@widgets/AppNavbar";
import {useAppDispatch, useAppSelector, useEmployeeName, useProductPictures} from "@shared/hooks";
import {AppSlider} from "@shared/ui";

import {fetchProductDetails} from "../model/service/fetchProduct";
import {
    getCurrentProduct,
    getPageHasUpdated,
    getPageIsLoading
} from "../model/selectors/productSelectors/productSelectors";
import {productDetailsPageActions, productDetailsPageReducer} from "../model/slice/productDetailsSlice";


const initialReducers: ReducersList = {
    'productDetails': productDetailsPageReducer,
}

export const ProductDetailsPage = () => {
    const {productId} = useParams();
    const dispatch = useAppDispatch();

    const {getNameById} = useEmployeeName();

    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    const product = useAppSelector(getCurrentProduct);
    const isLoading = useAppSelector(getPageIsLoading);
    const hasUpdated = useAppSelector(getPageHasUpdated);

    const productPictures = useProductPictures(product);

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductDetails({
                id: Number(productId),
            }))
        }
    }, [dispatch, productId, hasUpdated]);

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            <ModalProvider>
                <div className={cls.pageContainer}>
                    <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>

                    {isLoading
                        ?
                        <p>Загрузка...</p>
                        :
                        <Container fluid className={cls.pageContent} data-bs-theme={'light'}>
                            <h4 className={'my-2 mx-4'}>
                                Информация по изделию
                            </h4>
                            <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>

                            {product &&
                                <div>
                                    <div className={'d-flex justify-content-start gap-3'}>
                                        <div className={cls.sliderBlock}>
                                            <AppSlider images={productPictures.images} width={'300px'}
                                                       height={'300px'}/>
                                        </div>

                                        <Table bordered size={'sm'}>
                                            <tbody>
                                            <tr>
                                                <th>Наименование товара:</th>
                                                <td>{product?.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Технологический процесс подтвердил:</th>
                                                <td>
                                                    {getNameById(product.technological_process_confirmed, 'nameLastName')}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Наряды с изделием:</th>
                                                <td>
                                                    <Link to={`/assignment?order_product__product__id=${product.id}`}>
                                                        <button className={'appBtn blueBtn px-2 mx-2'}>
                                                            Перейти
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Наряд разработки:</th>
                                                <td>
                                                    <Link to={`/assignment?order_product__product__id=${product.id}&department__id=2`}>
                                                        <button className={'appBtn blueBtn px-2 mx-2'}>
                                                            Перейти
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Тарифы по изделию:</th>
                                                <td>
                                                    <Link to={`/tariffication?product__name=${product.name}`}>
                                                        <button className={'appBtn blueBtn px-2 mx-2'}>
                                                            Перейти
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>

                                            </tbody>

                                        </Table>


                                        <hr/>
                                    </div>
                                    <TechProcessWidget
                                        product={product}
                                        updCallback={() => dispatch(productDetailsPageActions.hasUpdated())}
                                    />
                                </div>
                            }
                        </Container>
                    }
                </div>
            </ModalProvider>
        </DynamicComponent>
    )
        ;
};
