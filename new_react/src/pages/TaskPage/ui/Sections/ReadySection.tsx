import {useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getReadyData} from "../../model/selectors";
import {TaskStatus} from "../../model/consts";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "@pages/TaskPage/ui/TaskPageCard/TaskCardSkeleton";

export const ReadySection = () => {
    const dispatch = useAppDispatch();
    const {queryParameters, setQueryParam} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const readyData = useAppSelector(getReadyData);

    useEffect(() => {
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
    }, [
        dispatch,
        filtersInited,
        queryParameters.sort_mode,
        queryParameters.users,
        queryParameters.view_mode,
        queryParameters.week,
        queryParameters.year,
        queryParameters.departments,
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
                height: `100%`,
                overflowX: "hidden",
                overflowY: "auto",
                width: "100%",
                maxWidth: "1300px",
            }}
        >
            {readyData?.isLoading
                ?
                <>
                    <TaskCardSkeleton/>
                    <TaskCardSkeleton/>
                    <TaskCardSkeleton/>
                </>
                :
                <>
                    {readyData?.results?.map(card => (
                        <TaskPageCard
                            id={`ready-task-id-${card.id}`}
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
