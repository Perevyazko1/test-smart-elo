import {useSelector} from "react-redux";
import React, {useEffect} from "react";

import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {classNames} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {getPaginationSize} from "shared/api/configs";
import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";

import {eqContentMobileReducer} from "../../../model/slice/eqContentMobileSlice";
import {fetchListData} from "../../../model/service/apiDesktop/fetchListData";
import {EqMobileCard} from "../../widgets/EqCard/ui/EqMobileCard/EqMobileCard";
import {getEqMobileList, getEqMobileListInfo} from "../../../model/selectors/mobileSelectors/mobileSelectors";

import {getNoRelevantId, listsHasUpdated} from "../../../model/selectors/filtersSelectors/filtersSelectors";
import {fetchEqUpdateCard} from "../../../model/service/apiDesktop/fetchEqUpdateCard";

import cls from './EqMobileContent.module.scss';

const initialReducers: ReducersList = {
    eqMobile: eqContentMobileReducer,
}

const EqMobileContent = () => {
    const dispatch = useAppDispatch();
    const listProps = useAppSelector(getEqMobileListInfo);
    const noRelevantId = useAppSelector(getNoRelevantId);
    const hasUpdated = useAppSelector(listsHasUpdated);

    useEffect(() => {

        dispatch(fetchListData({
            target_list: 'mobile',
            offset: 0,
            limit: getPaginationSize(window.innerHeight, 175, 1.8),
        }))
    }, [dispatch, hasUpdated])

    const fetchNextPage = () => {
        if (listProps.next) {
            dispatch(fetchListData({
                url: listProps.next,
                target_list: 'mobile',
            }))
        }
    }

    useEffect(() => {
        if (noRelevantId.length > 0) {
            dispatch(fetchEqUpdateCard({
                mode: 'GET',
                series_id: noRelevantId[0],
                variant: "mobile",
            }))
        }
    }, [dispatch, noRelevantId])

    const skeleton = (scaled: boolean) => (
        <Skeleton width={'100%'}
                  height={'175px'}
                  className={'mb-1'}
                  rounded
                  scaled={scaled}
                  pagination_size={3}
        />
    )

    const cardList = useSelector(getEqMobileList.selectAll)

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <PageWithPagination
                hasMore={!!listProps.next}
                className={classNames(cls.contentBlock, {}, ['px-1'])}
                skeleton={skeleton(false)}
                scroll_callback={fetchNextPage}
            >
                <div className={classNames(cls.contentWrapper, {}, ["pt-1 p-0"])}>

                    <StickyHeader loading={listProps.isLoading}>
                        Список изделий
                    </StickyHeader>

                    {cardList.map((eqCard) => (
                        <EqMobileCard
                            key={eqCard.series_id}
                            eqCard={eqCard}
                        />
                    ))}

                    {listProps?.isLoading && cardList.length === 0 && skeleton(true)}
                </div>
            </PageWithPagination>
        </DynamicModuleLoader>
    );
};

export default EqMobileContent;