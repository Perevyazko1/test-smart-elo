import {useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getReadyData} from "../../model/selectors";
import {TaskStatus} from "../../model/consts";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "@pages/TaskPage/ui/TaskPageCard/TaskCardSkeleton";

export const ReadySection = () => {
    const dispatch = useAppDispatch();
    const {queryParameters} = useQueryParams();
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
                }))
            } else {
                dispatch(getTaskCards({
                    status: TaskStatus.Cancelled,
                    sort_mode: queryParameters.sort_mode,
                    view_mode: queryParameters.view_mode,
                    week: queryParameters.week,
                    year: queryParameters.year,
                    users: queryParameters.users,
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
    ]);

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
