import React, {useEffect} from 'react';
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
import {fetchAwaitList} from "../../model/service/fetchAwaitList/fetchAwaitList";
import {fetchNextAwaitList} from "../../model/service/fetchAwaitList/fetchNextAwaitList";
import {fetchAwaitCard} from "../../model/service/fetchAwaitList/fetchAwaitCard";


const reducers: ReducersList = {
    'eqAwaitList': eqAwaitListReducer,
}

export const EqAwaitBlock = () => {
    const dispatch = useAppDispatch();
    const awaitData = useSelector(getEqAwaitList)
    const awaitList = useSelector(getEqAwaitListData.selectAll);

    useEffect(() => {
        if (awaitData?.has_updated !== undefined) {
            dispatch(fetchAwaitList({
                limit: EQ_LIST_PAGINATION_SIZE,
                offset: 0
            }))
        }
    }, [dispatch, awaitData?.has_updated])

    useEffect(() => {
        if (awaitData?.not_relevant_id && awaitData.not_relevant_id.length > 0) {
            dispatch(fetchAwaitCard({id: awaitData?.not_relevant_id[0]}))
        }
    }, [awaitData?.not_relevant_id, dispatch])

    const fetchNextPage = () => {
        if (awaitData?.next) {
            dispatch(fetchNextAwaitList({url: awaitData.next}))
        }
    }

    return (
        <DynamicModuleLoader reducers={reducers} removeAfterUnmount>
            <PageWithPagination hasMore={!!awaitData?.next}
                                className="col m-0"
                                scroll_callback={fetchNextPage}
                                style={{
                                    height: "93vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",
                                    borderLeftWidth: "4px", borderLeftStyle: "solid"
                                }}
            >
                <div className="p-1">

                    <StickyHeader loading={awaitData?.is_loading}>
                        Список изделий в очереди
                    </StickyHeader>

                    <TransitionGroup>

                        {awaitList?.map((order_product) => (
                            <CSSTransition
                                key={order_product.series_id}
                                timeout={500}
                                classNames="fade"
                            >
                                <div>
                                    <OrderProductCard
                                        order_product={order_product}
                                        card_type={CardType.AWAIT_CARD}
                                        disabled={awaitData?.not_relevant_id.includes(order_product.id)}
                                    />
                                </div>
                            </CSSTransition>
                        ))}

                    </TransitionGroup>
                    {awaitData?.is_loading
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
};