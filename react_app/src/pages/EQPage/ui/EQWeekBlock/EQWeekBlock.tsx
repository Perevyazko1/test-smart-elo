import React, {memo, useEffect} from 'react';

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {fetchWeekInfo} from "../../model/service/fetchWeekInfo/fetchWeekInfo";
import {useSelector} from "react-redux";
import {getWeekInfo} from "../../model/selectors/getWeekInfo/getWeekInfo";


export const EqWeekBlock = memo(() => {
    const dispatch = useAppDispatch()
    const week_info = useSelector(getWeekInfo)

    useEffect(() => {
        changeWeek()
    }, [])

    const changeWeek = (week: number | undefined = undefined, year: number | undefined = undefined) => {
        dispatch(fetchWeekInfo({
            week: week,
            year: year
        }))
    }

    return (
        <div className="row m-0"
             style={{
                 height: "7vh",
                 borderWidth: "3px",
                 borderStyle: "solid",
                 borderRadius: "6px",
                 background: "rgba(255,224,115,0.93)"
             }}>
            <div className="col d-flex justify-content-evenly align-items-xl-center">
                <button className="btn btn-dark btn-sm fw-bold border rounded border-2 border-dark me-2"
                        type="button"
                        style={{width: "120px"}}
                        onClick={() => changeWeek(
                            week_info?.previous_week_data.week,
                            week_info?.previous_week_data.year
                        )}
                >
                    Пред. неделя
                </button>

                <div className="fw-bold mb-xl-0"
                     style={{fontSize: "14px"}}
                >
                    <>
                        {
                            "Неделя " + week_info?.week +
                            " с " + week_info?.str_dates[0] +
                            " по " + week_info?.str_dates[6] +
                            " | Зараб.: 20 000"
                        }
                    </>
                </div>

                <button className="btn btn-dark btn-sm fw-bold border rounded border-2 border-dark ms-2"
                        type="button"
                        style={{width: "120px"}}
                        onClick={() => changeWeek(week_info?.next_week_data.week, week_info?.next_week_data.year)}
                >
                    След. неделя
                </button>
            </div>
        </div>
    );
});