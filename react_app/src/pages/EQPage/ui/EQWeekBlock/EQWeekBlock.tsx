import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";

import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {fetchWeekInfo} from "../../model/service/fetchWeekInfo/fetchWeekInfo";
import {getWeekInfo} from "../../model/selectors/getWeekInfo/getWeekInfo";
import {getWeekInfoUpdated} from "../../model/selectors/getWeekInfoUpdated/getWeekInfoUpdated";
import {getWeekInfoIsLoading} from "../../model/selectors/getWeekInfoIsLoading/getWeekInfoIsLoading";
import {eqReadyListActions} from "../../model/slice/readyListSlice";


export const EqWeekBlock = () => {
    const dispatch = useAppDispatch()
    const week_info = useSelector(getWeekInfo)
    const is_loading = useSelector(getWeekInfoIsLoading)
    const hasUpdated = useSelector(getWeekInfoUpdated)


    const [week, setWeek] = useState(week_info?.week)
    const [year, setYear] = useState(week_info?.year)

    const get_earned_sum = (Math.trunc(week_info?.earned || 0)).toLocaleString()

    const changeWeek = (week: number | undefined, year: number | undefined) => {
        setWeek(week)
        setYear(year)
        dispatch(fetchWeekInfo({
            week: week,
            year: year,
        })).then(() => {
            dispatch(eqReadyListActions.hasUpdated())
        })
    }

    useEffect(() => {
        dispatch(fetchWeekInfo({
            week: week,
            year: year,
        }))
        // eslint-disable-next-line
    }, [dispatch, hasUpdated])

    return (
        <div
            className="row border border-3 border-dark rounded m-0 d-flex flex-column align-items-center justify-content-evenly px-2"
            style={{
                height: "5vh",
                background: "rgba(255,224,115,0.93)"
            }}>

            {/*<div className={'bg-dark rounded d-flex align-items-center justify-content-center'}*/}
            {/*     style={{width: "40px", height: "4vh"}}*/}
            {/*>*/}
            {/*    <i className="fas fa-sort text-light fs-3"/>*/}
            {/*</div>*/}

            <button className="btn btn-dark btn-sm fw-bold rounded me-2 p-0 d-flex align-items-center
                    justify-content-center"
                    type="button"
                    style={{width: "80px", height: "90%"}}
                    onClick={() => changeWeek(
                        week_info?.previous_week_data.week,
                        week_info?.previous_week_data.year
                    )}
                    disabled={is_loading}
            >
                <i className="fas fa-angle-double-left fs-3"/>
            </button>

            <div className="fw-bold mb-xl-0"
                 style={{fontSize: "14px", width: "350px"}}
            >
                {is_loading
                    ? <Skeleton rounded height={'3vh'} width={'100%'}/>
                    :
                    <>
                        {
                            "Неделя " + week_info?.week +
                            " с " + week_info?.str_dates[0] +
                            " по " + week_info?.str_dates[6] +
                            " | Зараб.: " + get_earned_sum
                        }
                    </>
                }
            </div>

            <button className="btn btn-dark btn-sm fw-bold rounded ms-2 p-0 d-flex align-items-center
                    justify-content-center"
                    type="button"
                    style={{width: "80px", height: "90%"}}
                    onClick={() => changeWeek(week_info?.next_week_data.week, week_info?.next_week_data.year)}
                    disabled={is_loading}
            >
                <i className="fas fa-angle-double-right fs-3"/>
            </button>
        </div>
    );
};