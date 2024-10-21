import React, {useEffect} from "react";

import {TaskStatus} from "@entities/Task";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getAwaitData} from "../../model/selectors";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "../TaskPageCard/TaskCardSkeleton";

export const AwaitSection = () => {
    const dispatch = useAppDispatch();
    const {queryParameters, setQueryParam} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const awaitData = useAppSelector(getAwaitData);

    useEffect(() => {
        if (filtersInited) {
            const reqId = Date.now();

            dispatch(getTaskCards({
                status: TaskStatus.Pending,
                sort_mode: queryParameters.sort_mode,
                view_mode: queryParameters.view_mode,
                users: queryParameters.users,
                extended_search: queryParameters.extended_search,
                exclude_users: queryParameters.exclude_users,
                departments: queryParameters.departments,
                reqId: reqId,
            }))
        }
    }, [dispatch,
        filtersInited,
        queryParameters.sort_mode,
        queryParameters.view_mode,
        queryParameters.users,
        queryParameters.extended_search,
        queryParameters.exclude_users,
        queryParameters.departments,
    ]);

    useEffect(() => {
        if (queryParameters.await_scroll_to && awaitData && !awaitData.isLoading) {
            const element = document.getElementById(`await-task-id-${queryParameters.await_scroll_to}`);
            if (element) {
                element.scrollIntoView({behavior: 'smooth', block: 'start'});
                element.classList.add('jump')
            }
            setQueryParam('await_scroll_to', '')
        }
        // eslint-disable-next-line
    }, [awaitData?.isLoading, queryParameters.await_scroll_to]);

    return (
        <div style={{
            height: `100%`,
            maxWidth: '1300px',
            overflowX: "hidden",
            overflowY: "auto",
        }}>
            {awaitData?.isLoading
                ?
                <TaskCardSkeleton/>
                :
                <>
                    {awaitData?.results?.map(card => (
                        <TaskPageCard
                            id={`await-task-id-${card.id}`}
                            key={card.id}
                            card={card}
                            cardType={TaskStatus.Pending}
                        />
                    ))}
                </>
            }

        </div>
    );
};
