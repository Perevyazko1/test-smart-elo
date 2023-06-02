import React, {useEffect} from 'react';
import {useSelector} from "react-redux";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CardType, OrderProductCard} from "widgets/OrderProductCard";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";

import {fetchInWorkList} from "../../model/service/fetchInWorkList/fetchInWorkList";
import {fetchNextInWorkList} from "../../model/service/fetchInWorkList/fetchNextInWorkList";
import {eqInWorkListReducer, getEqInWorkList, getEqInWorkListData} from "../../model/slice/inWorkListSlice";
import {fetchInWorkCard} from "../../model/service/fetchInWorkList/fetchInWorkCard";
import {getPaginationSize} from "../../../../shared/api/configs";


const reducers: ReducersList = {
    'eqInWorkList': eqInWorkListReducer,
}

export const EqInWorkBlock = () => {
    const dispatch = useAppDispatch();
    const inWorkData = useSelector(getEqInWorkList)
    const inWorkList = useSelector(getEqInWorkListData.selectAll);

    useEffect(() => {
        if (inWorkData?.has_updated !== undefined) {
            dispatch(fetchInWorkList({
                limit: getPaginationSize(window.screen.height, 120),
                offset: 0
            }))
        }
    }, [dispatch, inWorkData?.has_updated])

    useEffect(() => {
        if (inWorkData?.not_relevant_id && inWorkData?.not_relevant_id.length > 0) {
            dispatch(fetchInWorkCard({id: inWorkData?.not_relevant_id[0]}))
        }
    }, [inWorkData?.not_relevant_id, dispatch])

    const fetchNextPage = () => {
        if (inWorkData?.next) {
            dispatch(fetchNextInWorkList({url: inWorkData.next}))
        }
    }

    const sceleton = (
        <Skeleton width={'100%'}
                  height={'109px'}
                  className={'mt-1'}
                  rounded
                  scaled
                  pagination_size={3}
        />
    )

    return (
        <DynamicModuleLoader reducers={reducers} removeAfterUnmount>
            <PageWithPagination hasMore={!!inWorkData?.next}
                                className="col m-0"
                                scroll_callback={fetchNextPage}
                                style={{height: "44vh", overflow: "auto", overflowX: "hidden", overflowY: "auto"}}
                                skeleton={sceleton}
            >
                <div className="col p-1 m-0">

                    <StickyHeader loading={inWorkData?.is_loading}>
                        Список изделий в работе
                    </StickyHeader>

                    <TransitionGroup>

                        {inWorkList?.map((order_product) => (
                            <CSSTransition
                                key={order_product.series_id}
                                timeout={500}
                                classNames="fade"
                            >
                                <div>
                                    <OrderProductCard
                                        order_product={order_product}
                                        key={order_product.series_id}
                                        card_type={CardType.IN_WORK_CARD}
                                        disabled={inWorkData?.not_relevant_id.includes(order_product.id)}
                                    />
                                </div>
                            </CSSTransition>
                        ))}

                    </TransitionGroup>

                    {inWorkData?.is_loading && inWorkList.length === 0 && sceleton}

                </div>
            </PageWithPagination>
        </DynamicModuleLoader>
    );
};