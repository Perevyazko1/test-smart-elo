import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {EQ_LIST_PAGINATION_SIZE} from "shared/api/configs";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {CardType, OrderProductCard} from "widgets/OrderProductCard";

import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {eqAwaitListReducer, getEqAwaitList, getEqAwaitListData} from "../../model/slice/awaitListSlice";
import {eqAwaitListIsLoading} from "../../model/selectors/eqAwaitList";
import {fetchAwaitList} from "../../model/service/fetchAwaitList/fetchAwaitList";
import {fetchNextAwaitList} from "../../model/service/fetchAwaitList/fetchNextAwaitList";


const reducers: ReducersList = {
    'eqAwaitList': eqAwaitListReducer,
}

export const EqAwaitBlock = memo(() => {
    const dispatch = useAppDispatch();
    const awaitList = useSelector(getEqAwaitList)
    const cardList = useSelector(getEqAwaitListData.selectAll);
    const isFetching = useSelector(eqAwaitListIsLoading);

    useEffect(() => {
        dispatch(fetchAwaitList({
            limit: EQ_LIST_PAGINATION_SIZE,
            offset: 0
        }))
    }, [dispatch])

    const fetchNextPage = () => {
        if (awaitList?.next) {
            dispatch(fetchNextAwaitList({url: awaitList.next}))
        }
    }

    return (
        <DynamicModuleLoader reducers={reducers} removeAfterUnmount>
            <PageWithPagination data={awaitList}
                                className="col m-0"
                                scroll_callback={fetchNextPage}
                                style={{
                                    height: "93vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",
                                    borderLeftWidth: "4px", borderLeftStyle: "solid"
                                }}
            >
                <div className="p-1">

                    <StickyHeader loading={isFetching}>
                        Список изделий в очереди
                        {awaitList?.count && ` (${awaitList.count})`}
                    </StickyHeader>

                    <TransitionGroup>

                        {cardList?.map((order_product) => (
                            <CSSTransition
                                key={order_product.series_id}
                                timeout={500}
                                classNames="fade"
                            >
                                <div>
                                    <OrderProductCard
                                        order_product={order_product}
                                        card_type={CardType.AWAIT_CARD}
                                        disabled={isFetching}
                                    />
                                </div>
                            </CSSTransition>
                        ))}

                    </TransitionGroup>
                    {isFetching
                        &&
                        <Skeleton width={'100%'}
                                  height={'109px'}
                                  className={'mt-1'}
                                  rounded
                                  scaled
                                  pagination_size={3}
                        />
                    }
                </div>
            </PageWithPagination>
        </DynamicModuleLoader>
    );
});