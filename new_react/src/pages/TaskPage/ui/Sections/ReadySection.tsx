import React, {useEffect} from "react";

import {TaskStatus} from "@entities/Task";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getReadyData} from "../../model/selectors";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "../TaskPageCard/TaskCardSkeleton";

interface ReadySectionProps {
    eqMode?: boolean;
}


export const ReadySection = (props: ReadySectionProps) => {
    const {eqMode = false} = props;

    const dispatch = useAppDispatch();
    const {queryParameters, setQueryParam} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const readyData = useAppSelector(getReadyData);

    useEffect(() => {
        if (eqMode) {
            dispatch(getTaskCards({
                status: TaskStatus.Completed,
                sort_mode: '1',
                view_mode: '9',
                week: queryParameters.week,
                year: queryParameters.year,
                users: undefined,
                departments: undefined,
            }))
        }
    }, [dispatch, eqMode, queryParameters.week, queryParameters.year]);

    useEffect(() => {
        if (!eqMode) {
            if (filtersInited) {
                if (queryParameters.view_mode !== '3') {
                    dispatch(getTaskCards({
                        status: TaskStatus.Completed,
                        sort_mode: queryParameters.sort_mode,
                        view_mode: queryParameters.view_mode,
                        week: queryParameters.week,
                        year: queryParameters.year,
                        users: queryParameters.users,
                        departments: queryParameters.departments,
                    }))
                } else {
                    dispatch(getTaskCards({
                        status: TaskStatus.Cancelled,
                        sort_mode: queryParameters.sort_mode,
                        view_mode: queryParameters.view_mode,
                        week: queryParameters.week,
                        year: queryParameters.year,
                        users: queryParameters.users,
                        departments: queryParameters.departments,
                    }))
                }
            }
        }
    }, [
        dispatch,
        filtersInited,
        queryParameters.sort_mode,
        queryParameters.users,
        queryParameters.view_mode,
        queryParameters.week,
        queryParameters.year,
        queryParameters.departments,
        eqMode
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
                            scaled={eqMode}
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
