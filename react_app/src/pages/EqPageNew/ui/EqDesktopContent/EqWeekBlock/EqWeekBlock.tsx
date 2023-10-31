import React, {memo, useEffect} from 'react';
import {Button} from "react-bootstrap";
import {ConnectDragSource} from "react-dnd";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import useDoubleTap from "shared/lib/hooks/useDoubleTap/useDoubleTap";
import {getCurrentDepartment} from "entities/Employee";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import useDivWidth from "shared/lib/hooks/useComponentWidth/useComponentWidth";

import {getWeekData} from "../../../model/selectors/filtersSelectors/filtersSelectors";
import {fetchWeekData} from "../../../model/service/fetchWeekData";
import {eqFiltersActions} from "../../../model/slice/eqFiltersSlice";
import {eqContentDesktopActions} from "../../../model/slice/eqContentDesktopSlice";
import {useQueryParams} from "../../../../../shared/lib/hooks/useQueryParams/useQueryParams";

interface EqWeekBlockProps {
    onDoubleClick?: () => void;
    isDragging?: boolean;
    drag?: ConnectDragSource;
}


export const EqWeekBlock = memo((props: EqWeekBlockProps) => {
    const {
        onDoubleClick,
        isDragging,
        drag,
    } = props;

    const {setQueryParam, queryParameters} = useQueryParams();

    const dispatch = useAppDispatch();
    const weekData = useAppSelector(getWeekData);
    const currentDepartment = useAppSelector(getCurrentDepartment);
    const {width: weekBlockWidth, ref: weekBlockRef} = useDivWidth();


    const handleDoubleTap = useDoubleTap(onDoubleClick);

    const getEarnedSum = weekData?.earned || "0"

    const getWeekString = () => {
        if (weekBlockWidth > 650) {
            return `Неделя ${weekData?.week} 
            с ${weekData?.str_dates ? weekData.str_dates[0] : ''} 
            по ${weekData?.str_dates ? weekData.str_dates[6] : ''}  
            | ЗП: ${getEarnedSum}`;
        } else if (weekBlockWidth > 600) {
            return `Нед. ${weekData?.week} 
            с ${weekData?.str_dates ? weekData.str_dates[0] : ''} 
            по ${weekData?.str_dates ? weekData.str_dates[6] : ''}  
            | ЗП: ${getEarnedSum}`;
        } else if (weekBlockWidth > 500) {
            return `Нед. ${weekData?.week} | ЗП: ${getEarnedSum}`;
        } else if (weekBlockWidth > 400) {
            return `Нед. ${weekData?.week}`;
        } else {
            return `${weekData?.week}`;
        }
    }

    useEffect(() => {
        if (weekData?.hasUpdated !== undefined) {
            dispatch(fetchWeekData({}))
        }
    }, [dispatch, weekData?.hasUpdated])

    const changeWeek = (week: number | undefined, year: number | undefined) => {
        setQueryParam('week', String(week));
        setQueryParam('year', String(year));
        dispatch(eqFiltersActions.setWeekData({
            week: week,
            year: year,
        }))
        if (drag) {
            dispatch(eqContentDesktopActions.readyListHasUpdated())
        } else {
            dispatch(eqFiltersActions.listsHasUpdated())
        }

    }

    return (
        <div
            className="border border-3 border-dark rounded m-0 d-flex align-items-center justify-content-between px-3"
            style={{
                background: currentDepartment?.color || "rgba(255,224,115,0.93)",
                opacity: isDragging ? 0.5 : 1,
                width: "100%",
                height: "40px",
                minHeight: "40px",
            }}
            ref={weekBlockRef}
        >
            <Button className="me-2 p-0 d-flex align-items-center justify-content-center"
                    type="button"
                    variant={'dark'}
                    size={'sm'}
                    style={{width: "50px", height: "90%"}}
                    onClick={() => changeWeek(
                        weekData?.previous_week_data?.week,
                        weekData?.previous_week_data?.year
                    )}
                    disabled={weekData?.isLoading}
            >
                <i className="fas fa-angle-double-left fs-3"/>
            </Button>


            <div className="fw-bold text-center text-dark"
                 style={{fontSize: "14px", width: `${weekBlockWidth - 220 - (!!drag ? 50 : 0)}px`}}
            >
                {weekData?.isLoading
                    ?
                    <Skeleton
                        rounded
                        height={'80%'}
                        width={'100%'}
                    />
                    :
                    <>
                        {getWeekString()}
                    </>
                }
            </div>

            <Button className="ms-2 p-0 d-flex align-items-center justify-content-center"
                    type={"button"}
                    variant={'dark'}
                    size={'sm'}
                    style={{width: "50px", height: "90%"}}
                    disabled={weekData?.isLoading}
                    onClick={() => changeWeek(
                        weekData?.next_week_data?.week,
                        weekData?.next_week_data?.year
                    )}
            >
                <i className="fas fa-angle-double-right fs-3"/>
            </Button>

            {!!drag &&
                <div className={'bg-dark rounded d-flex align-items-center justify-content-center ms-2'}
                     style={{
                         width: "40px",
                         height: "90%",
                         touchAction: 'none',
                         cursor: 'grab',
                     }}
                     ref={drag}
                     onDoubleClick={onDoubleClick}
                     onTouchEnd={(e) => handleDoubleTap(e)}
                >
                    <i className="fas fa-compress-alt text-light fs-3"/>
                </div>
            }
        </div>
    );
});