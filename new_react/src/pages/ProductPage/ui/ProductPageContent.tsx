import React, {useEffect, useMemo, useState} from "react";

import cls from './ProductPage.module.scss';
import {getPaginationSize} from "@shared/lib";
import {useAppDispatch, useAppQuery, useAppSelector} from "@shared/hooks";

import {getProductsList, getProductsProps} from "../model/selectors/productsSelector";
import {fetchProducts} from "../model/service/fetchProducts";
import {productsPageActions} from "../model/slice/productsPageSlice";
import {Spinner, Table} from "react-bootstrap";
import {AppSkeleton} from "@shared/ui";
import {PaginationContainer} from "@features";
import {ProductPageRow} from "@pages/ProductPage/ui/ProductPageRow";

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
                <hr className={'p-0 me-1 mx-2 mt-0 w-25'}/>
            </div>

            <Table striped bordered hover size="sm">
                <thead>
                <tr>
                    <th className={'text-center'}>
                        Изображение
                    </th>
                    <th className={'text-center'}>
                        Наименование
                    </th>
                    <th className={'text-center'}>
                        Тех-процесс
                    </th>
                    <th className={'text-center'}>
                        Схему подтвердил
                    </th>
                </tr>
                </thead>

                <tbody style={{fontSize: '14px'}}>

                {productProps.isLoading && productList.length === 0 ?
                    <>{PageSkeletons}</>
                    :
                    <>
                        {productList.map((product) => (
                            <ProductPageRow key={product.id} product={product}/>
                        ))}
                        {!!productProps.next && PageSkeletons}
                    </>
                }
                </tbody>
            </Table>
        </PaginationContainer>
    );
};
