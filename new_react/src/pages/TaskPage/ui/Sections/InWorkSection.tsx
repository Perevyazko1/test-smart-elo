import {useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import {getTaskCards} from "../../model/api/getTaskCards";
import {allFiltersInited, getInWorkData} from "../../model/selectors";
import {TaskStatus} from "../../model/consts";

import {TaskPageCard} from "../TaskPageCard/TaskPageCard";
import {TaskCardSkeleton} from "@pages/TaskPage/ui/TaskPageCard/TaskCardSkeleton";

export const InWorkSection = () => {
    const dispatch = useAppDispatch();
    const {queryParameters} = useQueryParams();
    const filtersInited = useAppSelector(allFiltersInited);
    const inWorkData = useAppSelector(getInWorkData);

    useEffect(() => {
        if (filtersInited) {
            dispatch(getTaskCards({
                status: TaskStatus.InProgress,
                sort_mode: queryParameters.sort_mode,
                view_mode: queryParameters.view_mode,
            }))
        }
    }, [dispatch, filtersInited, queryParameters.view_mode, queryParameters.sort_mode]);

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
