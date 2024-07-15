import {useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getAwaitData} from "../../model/selectors";
import {TaskStatus} from "../../model/consts";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "../TaskPageCard/TaskCardSkeleton";

export const AwaitSection = () => {
    const dispatch = useAppDispatch();
    const {queryParameters} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const awaitData = useAppSelector(getAwaitData);

    useEffect(() => {
        if (filtersInited) {
            dispatch(getTaskCards({
                status: TaskStatus.Pending,
                sort_mode: queryParameters.sort_mode,
                view_mode: queryParameters.view_mode,
                users: queryParameters.users,
            }))
        }
    }, [dispatch, filtersInited, queryParameters.sort_mode, queryParameters.view_mode, queryParameters.users]);

    return (
        <div style={{
            height: `100%`,
            maxWidth: '1300px',
            overflowX: "hidden",
            overflowY: "auto",
            padding: ".15rem 0"
        }}>
            {awaitData?.isLoading
                ?
                <>
                    <TaskCardSkeleton/>
                    <TaskCardSkeleton/>
                    <TaskCardSkeleton/>
                </>
                :
                <>
                    {awaitData?.results?.map(card => (
                        <TaskPageCard
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
