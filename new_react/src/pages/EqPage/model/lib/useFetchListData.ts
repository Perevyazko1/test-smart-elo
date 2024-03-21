import {useCallback, useEffect, useMemo, useRef} from "react";

import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser} from "@shared/hooks";

import {ListTypes} from "@pages/EqPage/model/consts/listTypes";
import {fetchListData} from "@pages/EqPage/model/api/fetchListData";
import {useCardHeight} from "@pages/EqPage/model/lib/useCardHeight";
import {eqFiltersReady} from "@pages/EqPage/model/selectors/filterSelectors";

interface useFetchListDataProps {
    listType: ListTypes;
    height: number;
    deps?: any[];
}

export const useFetchListData = (props: useFetchListDataProps) => {
    const {listType, height, deps = []} = props;

    const {currentUser} = useCurrentUser();
    const filtersReady = useAppSelector(eqFiltersReady);
    const {queryParameters} = useAppQuery();
    const cardHeight = useCardHeight();
    const dispatch = useAppDispatch();

    const initialHeight = useRef(height);

    // Лимит получаем путем запроса карточек количеством в 2 раза больше чем область видимости экрана
    const limit = useMemo(() => {
        if (initialHeight.current) {
            return Math.trunc(initialHeight.current / cardHeight * 1.8)
        }
    }, [cardHeight])


    useEffect(() => {
        if (filtersReady) {
            console.log(queryParameters)
            const fetchData = async () => {
                const reqId = Date.now()
                try {
                    // Первый запрос на сервер
                    const initialResponse = await dispatch(fetchListData({
                        target_list: listType,
                        offset: 0,
                        limit: limit,
                        department_number: currentUser.current_department.number,
                        reqId,
                        ...queryParameters,
                    })).unwrap();

                    if (initialResponse.count && limit && initialResponse.count > limit) {
                        // Если количество элементов больше limit, делаем второй запрос
                        await dispatch(fetchListData({
                            target_list: listType,
                            limit: initialResponse.count - limit, // Запрашиваем оставшиеся элементы
                            offset: limit,
                            department_number: currentUser.current_department.number,
                            reqId,
                            ...queryParameters, // Запрашиваем все элементы
                        })).unwrap();
                    }
                } catch (error) {
                    console.error('Ошибка при получении данных:', error);
                    throw error;
                }
            }
            fetchData().then()
        }
        //eslint-disable-next-line
    }, [...deps,
        filtersReady,
    ]);

    return;
}