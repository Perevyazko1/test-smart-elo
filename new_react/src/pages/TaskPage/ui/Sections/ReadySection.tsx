import React, {useEffect} from "react";

import {TaskStatus} from "@entities/Task";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getReadyData} from "../../model/selectors";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "../TaskPageCard/TaskCardSkeleton";

interface ReadySectionProps {
    eqMode?: boolean;
    targetUserId?: number;
    start_date?: string | undefined;
    end_date?: string | undefined;
}


export const ReadySection = (props: ReadySectionProps) => {
    const {eqMode = false, targetUserId, end_date, start_date} = props;

    const dispatch = useAppDispatch();
    const {queryParameters, setQueryParam} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const readyData = useAppSelector(getReadyData);

    useEffect(() => {
        if (eqMode) {
            const reqId = Date.now();

            dispatch(getTaskCards({
                status: TaskStatus.Completed,
                sort_mode: '1',
                view_mode: '9',
                end_date: end_date,
                start_date: start_date,
                users: undefined,
                exclude_users: undefined,
                extended_search: undefined,
                user: targetUserId,
                departments: undefined,
                reqId: reqId,
            }))
        }
    }, [end_date, start_date, dispatch, eqMode, queryParameters.week, queryParameters.year, targetUserId]);

    useEffect(() => {
        if (!eqMode) {
            if (filtersInited) {
                const reqId = Date.now();

                if (queryParameters.view_mode !== '3') {
                    dispatch(getTaskCards({
                        status: TaskStatus.Completed,
                        sort_mode: queryParameters.sort_mode,
                        view_mode: queryParameters.view_mode,
                        start_date: queryParameters.start_date,
                        end_date: queryParameters.end_date,
                        users: queryParameters.users,
                        extended_search: queryParameters.extended_search,
                        exclude_users: queryParameters.exclude_users,
                        departments: queryParameters.departments,
                        reqId: reqId,
                    }))
                } else {
                    dispatch(getTaskCards({
                        status: TaskStatus.Cancelled,
                        sort_mode: queryParameters.sort_mode,
                        view_mode: queryParameters.view_mode,
                        start_date: queryParameters.start_date,
                        end_date: queryParameters.end_date,
                        users: queryParameters.users,
                        extended_search: queryParameters.extended_search,
                        exclude_users: queryParameters.exclude_users,
                        departments: queryParameters.departments,
                        reqId: reqId,
                    }))
                }
            }
        }
    }, [
        dispatch,
        filtersInited,
        queryParameters.sort_mode,
        queryParameters.users,
        queryParameters.extended_search,
        queryParameters.exclude_users,
        queryParameters.view_mode,
        queryParameters.departments,
        eqMode,
        queryParameters.start_date,
        queryParameters.end_date
    ]);


    useEffect(() => {
        if (queryParameters.ready_scroll_to && readyData && !readyData?.isLoading) {
            const element = document.getElementById(`ready-task-id-${queryParameters.ready_scroll_to}`);
            if (element) {
                element.scrollIntoView({behavior: 'smooth', block: 'start'});
                element.classList.add('jump')
            }
            setQueryParam('ready_scroll_to', '')
        }
        // eslint-disable-next-line
    }, [readyData?.isLoading, queryParameters.ready_scroll_to]);

    return (
        <div
            style={{
                display: 'block',
                // height: `100%`,
                overflowX: "hidden",
                overflowY: "auto",
                width: "100%",
                maxWidth: "1300px",
            }}
        >
            {readyData?.isLoading
                ?
                <TaskCardSkeleton/>
                :
                <>
                    {readyData?.results?.map(card => (
                        <TaskPageCard
                            id={`ready-task-id-${card.id}`}
                            targetUserId={targetUserId}
                            key={card.id}
                            card={card}
                            cardType={TaskStatus.Completed}
                        />
                    ))}
                </>
            }
        </div>
    );
};
