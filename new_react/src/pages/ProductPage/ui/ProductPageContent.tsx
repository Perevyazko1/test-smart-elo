import React, {useCallback, useEffect, useMemo, useState} from "react";

import cls from './ProductPage.module.scss';

import {Product} from "@entities/Product";
import {getEmployeeName, getPaginationSize} from "@shared/lib";
import {useAppDispatch, useAppQuery, useAppSelector} from "@shared/hooks";

import {getProductsList, getProductsProps} from "../model/selectors/productsSelector";
import {fetchProducts} from "../model/service/fetchProducts";
import {productsPageActions} from "../model/slice/productsPageSlice";
import {Container, Spinner, Table} from "react-bootstrap";
import {AppSkeleton, AppSlider} from "@shared/ui";
import {PaginationContainer} from "@features";
import {Link} from "react-router-dom";

export const ProductPageContent = () => {
    const dispatch = useAppDispatch();
    const {queryParameters, initialLoad} = useAppQuery();

    const productList = useAppSelector(getProductsList.selectAll);
    const productProps = useAppSelector(getProductsProps);

    const paginationSize = useMemo(() => {
        return getPaginationSize(window.innerHeight, 30, 1.6);
    }, []);

    const [limitOffset, setLimitOffset] = useState({limit: paginationSize, offset: 0});


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
    };

    useEffect(() => {
        if (limitOffset.offset >= paginationSize) {
            getProducts(true);
        }
        //eslint-disable-next-line
    }, [limitOffset])

    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize, offset: 0})
            getProducts(false, paginationSize, 0);
            dispatch(productsPageActions.listHasUpdated())
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters])

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize
        })
    };


    const createImageUlsList = useCallback((product: Product) => {
        const imageSet = new Set<string>()
        product.product_pictures?.map((product_picture) => (
            product_picture.image && imageSet.add(product_picture.image)
        ))
        return Array.from(imageSet)
    }, [])

    const PageSkeletons = useMemo(() => (
        <>
            <tr>
                <td colSpan={4}><AppSkeleton style={{height: '104px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={4}><AppSkeleton style={{height: '104px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={4}><AppSkeleton style={{height: '104px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
        </>
    ), [])

    return (
        <PaginationContainer
            hasMore={!!productProps.next}
            scroll_callback={setNextPage}
            hasUpdated={!!productProps.hasUpdated}
            data-bs-theme={'light'}
            className={cls.pageContent}
        >

            <div className={cls.stickyWrapper}>
                <div className="d-flex align-items-center p-2">
                    <h4 className={'m-0'}>
                        Страница работы с товарами
                        {productProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}
                    </h4>
                </div>
                <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
            </div>

            <Container>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th className={'text-center'}>
                            <strong>
                                Изображение
                            </strong>
                        </th>
                        <th className={'text-center'}>
                            <strong>
                                Наименование
                            </strong>
                        </th>
                        <th className={'text-center'}>
                            <strong>
                                Тех-процесс
                            </strong>
                        </th>
                        <th className={'text-center'}>
                            <strong>
                                Схему подтвердил
                            </strong>
                        </th>
                    </tr>
                    </thead>

                    <tbody>

                    {productProps.isLoading && productList.length === 0 ?
                        <>{PageSkeletons}</>
                        :
                        <>
                            {productList.map((product) => (
                                <tr key={product.id}>
                                    <th>
                                        <AppSlider images={createImageUlsList(product)}/>
                                    </th>
                                    <th>
                                        <Link to={`/product/${product.id}`}
                                        >
                                            {product.name}
                                        </Link>
                                    </th>
                                    <th>{product.technological_process?.name || ''}</th>
                                    <th>
                                        {getEmployeeName(product.technological_process_confirmed)}
                                    </th>
                                </tr>
                            ))}
                            {!!productProps.next && PageSkeletons}
                        </>
                    }
                    </tbody>
                </Table>
            </Container>
        </PaginationContainer>
    );
};
