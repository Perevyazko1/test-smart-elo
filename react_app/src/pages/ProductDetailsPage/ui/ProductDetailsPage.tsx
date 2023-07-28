import React, {useEffect} from "react";
import {useParams} from "react-router-dom";
import {Container, Nav} from "react-bootstrap";

import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {classNames} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {Slider} from "shared/ui/Slider/Slider";
import {useProductPictures} from "shared/lib/hooks/useProductPictures/useProductPictures";

import {productDetailsPageActions, productDetailsPageReducer} from "../model/slice/productDetailsSlice";
import {fetchProductDetails} from "../model/service/fetchProduct";
import {
    getCurrentProduct,
    getPageHasUpdated,
    getPageIsLoading
} from "../model/selectors/productSelectors/productSelectors";

import cls from "./ProductDetailsPage.module.scss";
import {TechProcessInfo} from "../../../features/TechProcessInfo/ui/TechProcessInfo";

const initialReducers: ReducersList = {
    'productDetails': productDetailsPageReducer,
}

const ProductDetailsPage = () => {
    const {id} = useParams();
    const dispatch = useAppDispatch();
    const product = useAppSelector(getCurrentProduct);
    const isLoading = useAppSelector(getPageIsLoading);
    const hasUpdated = useAppSelector(getPageHasUpdated);

    const productPictures = useProductPictures(product);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails({
                id: Number(id),
            }))
        }
    }, [dispatch, id, hasUpdated]);

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Container className={classNames(cls.pageContainer, {}, [])}
                       fluid
                       data-bs-theme={'dark'}
            >
                <AppNavbar>
                    <Nav className="me-auto">
                        <UpdatePageBtn
                            className={'ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1 bg-body-tertiary px-3'}
                        />

                    </Nav>

                    <Nav>
                        <UserInfoWithRouts
                            className={"ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1"}
                            active
                        />
                    </Nav>

                </AppNavbar>

                <Container className={classNames(cls.pageContent, {}, ['py-2'])} data-bs-theme={'light'}>
                    {isLoading
                        ?
                        <p>Загрузка...</p>
                        :
                        <>
                            <h3 className={'my-2'}>
                                Страница детализации по изделию: {product?.name}
                            </h3>
                            <hr/>

                            <div>

                                <div className={'d-flex justify-content-start gap-3'}>
                                    <div className={
                                        classNames(cls.sliderBlock,
                                            {},
                                            ['border border-2 rounded'])
                                    }>
                                        <Slider images={productPictures} width={'300px'} height={'300px'}/>
                                    </div>

                                    <div className={cls.textBlock}>
                                        <p>
                                            Наименование товара: {product?.name}
                                        </p>
                                        <hr/>
                                    </div>
                                </div>
                                <hr className={'w-75'}/>

                                {product &&
                                    <TechProcessInfo
                                        product={product}
                                        updCallback={() => dispatch(productDetailsPageActions.hasUpdated())}
                                    />
                                }
                            </div>
                        </>
                    }
                </Container>
            </Container>
        </DynamicModuleLoader>
    );
};

export default ProductDetailsPage;

