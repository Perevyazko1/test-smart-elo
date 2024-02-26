import {Link, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";

import cls from "./ProductDetailsPage.module.scss";

import {ModalProvider} from "@app";
import {DynamicComponent, ReducersList} from "@features";
import {AppNavbar} from "@widgets/AppNavbar";
import {useAppDispatch, useAppSelector, usePermission, useProductPictures} from "@shared/hooks";
import {AppSlider} from "@shared/ui";

import {fetchProductDetails} from "../model/service/fetchProduct";
import {
    getCurrentProduct,
    getPageHasUpdated,
    getPageIsLoading
} from "../model/selectors/productSelectors/productSelectors";
import {productDetailsPageActions, productDetailsPageReducer} from "../model/slice/productDetailsSlice";
import {Button, Container} from "react-bootstrap";
import {TechProcessWidget} from "@widgets/TechProcessWidget/ui/TechProcessWidget";
import {APP_PERM} from "@shared/consts";


const initialReducers: ReducersList = {
    'productDetails': productDetailsPageReducer,
}

export const ProductDetailsPage = () => {
    const {productId} = useParams();
    const dispatch = useAppDispatch();
    const [showCanvas, setShowCanvas] = useState<boolean>(false);


    const product = useAppSelector(getCurrentProduct);
    const isLoading = useAppSelector(getPageIsLoading);
    const hasUpdated = useAppSelector(getPageHasUpdated);
    const eloPerm = usePermission(APP_PERM.ELO_PAGE);

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
                        <Container fluid className={cls.pageContent}>
                            <h4 className={'my-2 mx-4'}>
                                Информация по изделию
                            </h4>
                            <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>

                            {product ?

                                <div>

                                    <div className={'d-flex justify-content-start gap-3'}>
                                        <div className={cls.sliderBlock}>
                                            <AppSlider images={productPictures.images} width={'300px'}
                                                       height={'300px'}/>
                                        </div>

                                        <div className={cls.textBlock}>
                                            <p>
                                                <b>Наименование товара:</b> {product?.name}
                                            </p>
                                            {product.technological_process_confirmed ?
                                                <p>
                                                    <b>
                                                        Технологический процесс подтвердил:
                                                    </b>
                                                    {product.technological_process_confirmed?.first_name}
                                                    {product.technological_process_confirmed?.last_name}
                                                </p>
                                                :

                                                <p>
                                                    <b>Технологический процесс: </b>
                                                    {
                                                        product.technological_process ?
                                                            <>Не подтвержден. Проверьте наряд в конструкторском
                                                                отделе
                                                                {eloPerm ?
                                                                    <>
                                                                        ={"> "}
                                                                        <Link to={'/eq'}>
                                                                            <Button size={'sm'}
                                                                                    variant={'outline-secondary'}>
                                                                                Перейти в ЭЛО
                                                                            </Button>
                                                                        </Link>
                                                                    </>
                                                                    :
                                                                    <>.</>
                                                                }
                                                            </>
                                                            :
                                                            <>Не выбран. Выберите технологический процесс.</>
                                                    }
                                                </p>
                                            }

                                            <hr/>
                                        </div>
                                    </div>

                                    <TechProcessWidget product={product} updCallback={
                                        () => dispatch(productDetailsPageActions.hasUpdated())
                                    }/>

                                </div>
                                :
                                <> Ошибка загрузки изделия </>
                            }
                        </Container>
                    }
                </div>
            </ModalProvider>
        </DynamicComponent>
    );
};
