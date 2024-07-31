import React, {useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getInWorkData} from "../../model/selectors";
import {TaskStatus} from "../../model/consts";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "@pages/TaskPage/ui/TaskPageCard/TaskCardSkeleton";

export const InWorkSection = () => {
    const dispatch = useAppDispatch();
    const {queryParameters, setQueryParam} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const inWorkData = useAppSelector(getInWorkData);

    useEffect(() => {
        if (filtersInited) {
            dispatch(getTaskCards({
                status: TaskStatus.InProgress,
                sort_mode: queryParameters.sort_mode,
                view_mode: queryParameters.view_mode,
                users: queryParameters.users,
                departments: queryParameters.departments,
            }))
        }
    }, [dispatch,
        filtersInited,
        queryParameters.view_mode,
        queryParameters.sort_mode,
        queryParameters.users,
        queryParameters.departments,
    ]);

    useEffect(() => {
        if (queryParameters.in_work_scroll_to && inWorkData && !inWorkData?.isLoading) {
            const element = document.getElementById(`in-work-task-id-${queryParameters.in_work_scroll_to}`);
            if (element) {
                element.scrollIntoView({behavior: 'smooth', block: 'start'});
                element.classList.add('jump')
            }
            setQueryParam('in_work_scroll_to', '')
        }
        // eslint-disable-next-line
    }, [inWorkData?.isLoading, queryParameters.in_work_scroll_to]);

    return (
        <div style={{
            height: `100%`,
            overflowX: "hidden",
            overflowY: "auto",
            width: "100%",
            maxWidth: "1300px",
        }}>

            {inWorkData?.isLoading
                ?
                <>
                    <TaskCardSkeleton/>
                    <TaskCardSkeleton/>
                    <TaskCardSkeleton/>
                </>
                :
                <>
                    {inWorkData?.results?.map(card => (
                        <TaskPageCard
                            id={`in-work-task-id-${card.id}`}
                            key={card.id}
                            card={card}
                            cardType={TaskStatus.InProgress}
                        />
                    ))}
                </>
            }

        </div>
    );
};
