import React, {useEffect} from 'react';
import {useSelector} from "react-redux";
import {Row} from "react-bootstrap";

import {StateSchema} from "app/providers/StoreProvider";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {classNames} from "shared/lib/classNames/classNames";
import {getPaginationSize} from "shared/api/configs";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {EqDesktopCard} from "../../EqCard/ui/EqDesktopCard/EqDesktopCard/EqDesktopCard";
import {
    getEqAwaitList,
    getEqInWorkList,
    getEqReadyList,
} from "../../../model/selectors/desktopSelectors/desktopSelectors";
import {fetchListData} from "../../../model/service/fetchListData";
import {getListInfo} from "../../../model/selectors/propsSelectors/propsSelectors";
import {listsHasUpdated} from "../../../model/selectors/filtersSelectors/filtersSelectors";


interface EqCardSectionProps {
    listType: 'await' | 'in_work' | 'ready';
    widthPx: number;
    heightPx: number;
    cls: string;
}


export const EqCardSection = (props: EqCardSectionProps) => {
    const {
        listType,
        widthPx,
        heightPx,
        cls,
    } = props

    const dispatch = useAppDispatch();

    const cardList = useSelector(listType === 'await' ?
        getEqAwaitList.selectAll : listType === 'in_work' ?
            getEqInWorkList.selectAll :
            getEqReadyList.selectAll
    )

    const listProps = useSelector((state: StateSchema) => (getListInfo(state, listType)));
    const hasUpdated = useSelector(listsHasUpdated);

    const headerName = listType === 'await' ? 'Список изделий в очереди' :
        listType === 'in_work' ? 'Список изделий в работе' : 'Список готовых изделий'

    useEffect(() => {
        if (listProps.hasUpdated !== undefined) {
            dispatch(fetchListData({
                target_list: listType,
                offset: 0,
                limit: getPaginationSize(heightPx, 102, 1.8),
            }))
        }
        // eslint-disable-next-line
    }, [dispatch, listProps.hasUpdated, hasUpdated])

    const fetchNextPage = () => {
        if (listProps.next) {
            dispatch(fetchListData({
                url: listProps.next,
                target_list: listType,
            }))
        }
    }

    const skeleton = (scaled: boolean) => (
        <Skeleton width={'100%'}
                  height={'102px'}
                  className={'mt-1'}
                  rounded
                  scaled={scaled}
                  pagination_size={3}
        />
    )

    return (
        <PageWithPagination
            hasMore={!!listProps.next}
            hasUpdated={!!listProps.hasUpdated}
            className={classNames(cls, {}, ['row'])}
            skeleton={skeleton(false)}
            style={{
                width: `${widthPx}px`,
                height: `${heightPx}px`,
            }}
            scroll_callback={fetchNextPage}
        >
            <Row className="pt-1 p-0 m-0">
                <StickyHeader
                    loading={listProps.isLoading}
                >
                    {widthPx > 375 && headerName}
                </StickyHeader>


                {cardList.map((eq_card) => (
                    <EqDesktopCard
                        blockWidth={widthPx}
                        eqCard={eq_card}
                        cardType={listType}
                        key={eq_card.series_id}
                    />
                ))}

                {listProps?.isLoading && cardList.length === 0 && skeleton(true)}
            </Row>
        </PageWithPagination>
    );
};