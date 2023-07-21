import React, {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Container, Nav, Table} from "react-bootstrap";

import {AppRoutes} from "app/providers/Router";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {classNames} from "shared/lib/classNames/classNames";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getPaginationSize} from "shared/api/configs";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {useQueryParams} from "shared/lib/hooks/useQueryParams/useQueryParams";
import {useDebounce} from "shared/lib/hooks/useDebounce/useDebounce";
import {AppInput} from "shared/ui/AppInput/AppInput";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";

import {productsPageActions, productsPageReducer} from "../model/slice/productsPageSlice";
import {getProductsList, getProductsProps} from "../model/selectors/productsSelector";
import {fetchProducts} from "../model/service/fetchProducts";

import cls from "./ProductsPage.module.scss";
import {product} from "../../../entities/Product";
import {Slider} from "../../../shared/ui/Slider/Slider";


const initialReducers: ReducersList = {
    products: productsPageReducer,
}

const ProductsPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const {setQueryParam, queryParameters, initialLoad} = useQueryParams();
    const productsList = useAppSelector(getProductsList.selectAll);
    const productsProps = useAppSelector(getProductsProps);

    const paginationSize = useCallback(() => {
        return getPaginationSize(window.innerHeight, 30, 1.6);
    }, [])

    const [limitOffset, setLimitOffset] = useState({limit: paginationSize(), offset: 0});
    const [productNameInput, setProductNameInput] = useState<string>(queryParameters.name || '');

    const getProducts = (
        isNext: boolean = false,
        limit: number = limitOffset.limit,
        offset: number = limitOffset.offset
    ) => {
        dispatch(fetchProducts({
            isNext: isNext,
            limit: limit,
            offset: offset,
            ...queryParameters,
        }))
    }

    useEffect(() => {
        if (limitOffset.offset >= paginationSize()) {
            getProducts(true);
        }
        //eslint-disable-next-line
    }, [limitOffset])

    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize(), offset: 0})
            getProducts(false, paginationSize(), 0);
            dispatch(productsPageActions.listHasUpdated())
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters])

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize()
        })
    }

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    )

    useEffect(() => {
        debouncedSetQueryParam('name', productNameInput)
        // eslint-disable-next-line
    }, [productNameInput])

    const createImageUlsList = (product: product) => {
        const imageSet = new Set<string>()
        product.product_pictures?.map((product_picture) => (
            product_picture.image && imageSet.add(product_picture.image)
        ))
        return Array.from(imageSet)
    }


    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Container className={classNames(cls.pageContainer, {}, [])}
                       fluid
                       data-bs-theme={'dark'}
            >
                <AppNavbar>
                    <Nav className="me-auto">

                        <AppInput placeholder={'Наименование товара'}
                                  className={'my-auto ms-3 my-1'}
                                  onChange={(event) => setProductNameInput(event.target.value)}
                                  value={productNameInput}
                                  inputSize={'sm'}
                        />

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

                <PageWithPagination
                    hasUpdated={!!productsProps.hasUpdated}
                    data-bs-theme={'light'}
                    className={classNames(cls.pageContent, {}, ['container pt-2 mt-1'])}
                    hasMore={!!productsProps.next}
                    scroll_callback={setNextPage}
                    skeleton={
                        <Skeleton
                            height={'25px'}
                            width={'100%'}
                            rounded={false}
                            className={'mb-2 scaled'}
                            pagination_size={3}
                        />}
                >
                    <div className="d-flex align-items-center">
                        <h3>
                            Страница работы с товарами
                        </h3>
                    </div>
                    <hr className={'p-0 m-1 mb-2 w-25'}/>

                    {productsProps.isLoading && productsList.length === 0 ?
                        <Skeleton
                            height={'25px'}
                            width={'100%'}
                            rounded={false}
                            className={'mb-2 scaled'}
                            pagination_size={3}
                        /> :
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>
                                    <strong>
                                    Изображение
                                </strong>
                                </th>
                                <th>
                                    <strong>
                                        Наименование
                                    </strong>
                                </th>
                                <th>
                                    <strong>
                                        Тех-процесс
                                    </strong>
                                </th>
                                <th>
                                    <strong>
                                        Схему подтвердил
                                    </strong>
                                </th>
                            </tr>
                            </thead>

                            <tbody>

                            {productsList.map((product) => (
                                <tr key={product.id}
                                    onClick={() => navigate(
                                        `/${AppRoutes.PRODUCT_DETAILS.replace(':id', String(product.id))}`
                                    )}>
                                    <th>
                                        <Slider images={createImageUlsList(product)}/>
                                    </th>
                                    <th>{product.name}</th>
                                    <th>{product.technological_process?.name || ''}</th>
                                    <th>
                                        {
                                            `${product.technological_process_confirmed?.last_name || ""} 
                                            ${product.technological_process_confirmed?.first_name || ""}`
                                        }
                                    </th>
                                </tr>
                            ))}

                            </tbody>
                        </Table>
                    }
                </PageWithPagination>
            </Container>
        </DynamicModuleLoader>
    );
};

export default ProductsPage;