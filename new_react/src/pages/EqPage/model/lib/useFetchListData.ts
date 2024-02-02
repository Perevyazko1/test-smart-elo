import {ListTypes} from "@pages/EqPage/model/consts/listTypes";
import {useAppDispatch, useAppQuery, useCurrentUser} from "@shared/hooks";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {fetchListData} from "@pages/EqPage/model/api/fetchListData";
import {useCardHeight} from "@pages/EqPage/model/lib/useCardHeight";

interface useFetchListDataProps {
    listType: ListTypes;
    height: number;
    deps?: any[];
}

export const useFetchListData = (props: useFetchListDataProps) => {
    const {listType, height, deps = []} = props;

    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();
    const cardHeight = useCardHeight();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const initialHeight = useRef(height);

    // Лимит получаем путем запроса карточек количеством в 2 раза больше чем область видимости экрана
    const limit = useMemo(() => {
        if (initialHeight.current) {
            return Math.trunc(initialHeight.current / cardHeight * 1.8)
        }
    }, [cardHeight])

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Первый запрос на сервер
            console.log('Пошел первый запрос карточек ', listType)
            const initialResponse = await dispatch(fetchListData({
                target_list: listType,
                offset: 0,
                limit: limit,
                ...queryParameters,
            })).unwrap();

            if (initialResponse.count && limit && initialResponse.count > limit) {
                // Если количество элементов больше limit, делаем второй запрос
                console.log('Пошел второй запрос карточек ', listType)
                await dispatch(fetchListData({
                    target_list: listType,
                    limit: initialResponse.count - limit, // Запрашиваем оставшиеся элементы
                    offset: limit,
                    ...queryParameters, // Запрашиваем все элементы
                })).unwrap();
            }
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            throw error;
        } finally {
            setIsLoading(false); // Загрузка завершена
        }
        // eslint-disable-next-line
    }, [
        dispatch,
        listType,
        currentUser,
        queryParameters.view_mode,
        queryParameters.project,
        // eslint-disable-next-line
        ...deps]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {isLoading}
}