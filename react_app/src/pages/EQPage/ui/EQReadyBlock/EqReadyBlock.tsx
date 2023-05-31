import React, {useEffect} from 'react';
import {useSelector} from "react-redux";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CardType, OrderProductCard} from "widgets/OrderProductCard";
import {EQ_LIST_PAGINATION_SIZE} from "shared/api/configs";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {eqReadyListReducer, getEqReadyList, getEqReadyListData} from "../../model/slice/readyListSlice";
import {fetchReadyList} from "../../model/service/fetchReadyList/fetchReadyList";
import {fetchReadyCard} from "../../model/service/fetchReadyList/fetchReadyCard";
import {fetchNextReadyList} from "../../model/service/fetchReadyList/fetchNextReadyList";


const reducers: ReducersList = {
    'eqReadyList': eqReadyListReducer,
}

export const EqReadyBlock = () => {
    const dispatch = useAppDispatch();
    const readyData = useSelector(getEqReadyList)
    const readyList = useSelector(getEqReadyListData.selectAll);


    useEffect(() => {
        if (readyData?.has_updated !== undefined) {
            dispatch(fetchReadyList({
                limit: EQ_LIST_PAGINATION_SIZE,
                offset: 0
            }))
        }
    }, [dispatch, readyData?.has_updated])


    useEffect(() => {
        if (readyData?.not_relevant_id && readyData?.not_relevant_id.length > 0) {
            dispatch(fetchReadyCard({id: readyData?.not_relevant_id[0]}))
        }
    }, [readyData?.not_relevant_id, dispatch])

    const fetchNextPage = () => {
        if (readyData?.next) {
            dispatch(fetchNextReadyList({url: readyData.next}))
        }
    }


    return (
        <DynamicModuleLoader reducers={reducers} removeAfterUnmount>
            <PageWithPagination hasMore={!!readyData?.next}
                                className="col m-0"
                                scroll_callback={fetchNextPage}
                                style={{height: "44vh", overflow: "auto", overflowX: "hidden", overflowY: "auto",}}>
                <div className="p-1">

                    <StickyHeader loading={readyData?.is_loading}>
                        Список готовых изделий
                    </StickyHeader>

                    <TransitionGroup>

                        {readyList.map((order_product) => (
                            <CSSTransition
                                key={order_product.series_id}
                                timeout={500}
                                classNames="fade"
                            >
                                <div>
                                    <OrderProductCard
                                        order_product={order_product}
                                        key={order_product.series_id}
                                        card_type={CardType.READY_CARD}
                                        disabled={readyData?.not_relevant_id.includes(order_product.id)}
                                    />
                                </div>
                            </CSSTransition>
                        ))}

                    </TransitionGroup>
                    {readyData?.is_loading
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