import {PaginationContainer} from "@features";
import {useAppDispatch, useAppQuery, useAppSelector} from "@shared/hooks";

import cls from "./TarifficationBody.module.scss";

import {getNextUrl, getNoRelevantIds, getPageHasUpdated} from "../../model/selectors";

import {BodyHeader} from "./BodyHeader";
import {BodyTable} from "./BodyTable";
import {useEffect, useMemo, useState} from "react";
import {getPaginationSize} from "@shared/lib";
import {fetchTariffications} from "@pages/TarifficationPage/model/service/fetchTariffications";
import {fetchTariffication} from "@pages/TarifficationPage/model/service/fetchTariffication";


export const TarifficationBody = () => {
    const {queryParameters} = useAppQuery();

    const dispatch = useAppDispatch();

    const hasUpdated = useAppSelector(getPageHasUpdated);
    const noRelevantIds = useAppSelector(getNoRelevantIds);
    const nextUrl = useAppSelector(getNextUrl);

    const paginationSize = useMemo(() => {
        return getPaginationSize(window.innerHeight, 80, 1.6);
    }, []);

    const [limitOffset, setLimitOffset] = useState({limit: paginationSize, offset: 0});

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize
        })
    };

    useEffect(() => {
        if (noRelevantIds?.length && noRelevantIds?.length > 0) {
            dispatch(fetchTariffication({
                itemId: noRelevantIds[0]
            }))
        }
    }, [dispatch, noRelevantIds]);

    useEffect(() => {
        dispatch(fetchTariffications({
            isNext: false,
            limit: paginationSize,
            offset: 0,
            ...queryParameters,
        }))
        //eslint-disable-next-line
    }, [dispatch, queryParameters]);

    useEffect(() => {
        if (limitOffset.offset >= paginationSize) {
            dispatch(fetchTariffications({
                isNext: true,
                limit: limitOffset.limit,
                offset: limitOffset.offset,
                ...queryParameters,
            }))
        }
        //eslint-disable-next-line
    }, [limitOffset]);

    return (
        <PaginationContainer
            hasMore={!!nextUrl}
            scroll_callback={setNextPage}
            hasUpdated={!!hasUpdated}
            data-bs-theme={'light'}
            className={cls.pageContent}
        >
            <BodyHeader/>

            <BodyTable/>
        </PaginationContainer>
    );
};
