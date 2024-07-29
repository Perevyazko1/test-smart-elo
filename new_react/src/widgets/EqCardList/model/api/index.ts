import {useEffect, useMemo, useRef, useState} from "react";
import {useAppQuery, useCurrentUser} from "@shared/hooks";
import {$axiosAPI} from "@shared/api";
import {ApiList} from "@shared/types";
import {EqOrderProduct, ListTypes} from "../types";
import {useCardHeight} from "../lib/useCardHeight";

interface useFetchListDataProps {
    listType: ListTypes;
    height: number;
    deps?: any[];
    inited: boolean;
    extraParams?: object;
}

interface fetchListDataProps {
    target_list: ListTypes;
    department_id: number;
    limit?: number;
    offset?: number;
}

interface fetchItemDataProps {
    target_list: ListTypes;
    department_id: number;
}

const fetchListData = async (props: fetchListDataProps, signal: AbortSignal) => {
    try {
        const response = await $axiosAPI.get<ApiList<EqOrderProduct>>('/core/get_eq_cards/', {
            params: {
                ...props,
            },
            signal,
        });
        return response.data;
    } catch (e: any) {
        if (e.code === 'ERR_CANCELED') {
            throw new Error('RequestCanceled');
        } else {
            console.error('Ошибка при получении данных:', e);
            throw e;
        }
    }
}

const fetchItemData = async (id: number, props: fetchItemDataProps) => {
    try {
        const response = await $axiosAPI.get<EqOrderProduct>(`/core/get_eq_cards/${id}/`, {
            params: {
                ...props,
            },
        });
        if (response.data) {
            return response.data;
        }
    } catch (e: any) {
    }
}

export const useFetchListData = (props: useFetchListDataProps) => {
    const {listType, height, inited, deps = [], extraParams} = props;
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [data, setData] = useState<ApiList<EqOrderProduct> | undefined>();

    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();
    const cardHeight = useCardHeight();
    const initialHeight = useRef(height);

    const limit = useMemo(() => {
        if (initialHeight.current) {
            return Math.trunc(initialHeight.current / cardHeight * 1.8);
        }
    }, [cardHeight]);

    const fetchData = async () => {
        // Abort the previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create a new AbortController for the new request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        setIsLoading(true);
        setData(undefined);
        let aborted = false;


        try {
            const initialResponse = await fetchListData({
                target_list: listType,
                offset: 0,
                limit: limit,
                department_id: currentUser.current_department?.id || 0,
                ...queryParameters,
                ...extraParams,
            }, abortController.signal);

            if (initialResponse) {
                setData(initialResponse);

                if (limit && initialResponse.count > limit) {
                    const secondResponse = await fetchListData({
                        target_list: listType,
                        limit: initialResponse.count - limit,
                        offset: limit,
                        department_id: currentUser.current_department?.id || 0,
                        ...queryParameters,
                        ...extraParams,
                    }, abortController.signal);

                    if (secondResponse) {
                        const newData: ApiList<EqOrderProduct> = {
                            count: secondResponse.count,
                            previous: secondResponse.previous,
                            next: secondResponse.next,
                            results: [...initialResponse.results, ...secondResponse.results],
                        };
                        setData(newData);
                    }
                }
            }
        } catch (error: any) {
            if (error.message === 'RequestCanceled') {
                aborted = true;
            } else {
                console.error('Ошибка при получении данных:', error);
            }
        } finally {
            if (!aborted) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (inited) {
            fetchData().then();
        }
        //eslint-disable-next-line
    }, [...deps, inited]);

    const updateItem = async (id: number) => {
        try {
            const updatedItem = await fetchItemData(id, {
                target_list: listType,
                department_id: currentUser.current_department?.id || 0,
                ...queryParameters,
                ...extraParams,
            },);

            setData(prevData => {
                if (prevData) {
                    const updatedData: ApiList<EqOrderProduct> = {
                        ...prevData,
                        results: prevData.results
                            .filter(item => item.id !== id)
                            .concat(updatedItem ? [updatedItem] : []),
                    };
                    return updatedData;
                }
                return prevData;
            });
        } catch (error: any) {
            console.error('Ошибка при обновлении данных:', error);
        }
    }

    return {isLoading, data, updateItem};
}
