import React, {memo, useState} from 'react';
import {ConnectDragSource} from "react-dnd";
import {useSelector} from "react-redux";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import useDivWidth from "shared/lib/hooks/useComponentWidth/useComponentWidth";

import {getWeekData} from "../../../../model/selectors/filtersSelectors/filtersSelectors";

interface EqWeekBlockProps {
    isDragging?: boolean;
    drag: ConnectDragSource;
}


export const EqWeekBlock = memo((props: EqWeekBlockProps) => {
    const {
        isDragging,
        drag
    } = props

    const dispatch = useAppDispatch();
    const weekData = useSelector(getWeekData);
    const {width: weekBlockWidth, ref: weekBlockRef} = useDivWidth();

    const [week, setWeek] = useState<number | undefined>();
    const [year, setYear] = useState<number | undefined>();


    const get_earned_sum = (Math.trunc(weekData?.earned || 0)).toLocaleString()

    const getWeekString = () => {
        if (weekBlockWidth > 670) {
            return "Неделя 24 с 18.06 по 25.06 | Заработано: 35 000";
        } else if (weekBlockWidth > 570) {
            return "Нед. 24 с 18.06 по 25.06 | Зараб.: 35 000";
        } else if (weekBlockWidth > 470) {
            return "Нед. 24 | Зараб.: 35 000";
        } else if (weekBlockWidth > 270) {
            return "Нед. 24";
        } else if (weekBlockWidth > 170) {
            return "24";
        }
    }

    return (
        <div
            className="border border-3 border-dark rounded m-0 d-flex align-items-center justify-content-between px-3"
            style={{
                background: "rgba(255,224,115,0.93)",
                opacity: isDragging ? 0.5 : 1,
                width: "100%",
                height: "40px",
            }}
            ref={weekBlockRef}
        >
            <button className="btn btn-dark btn-sm fw-bold rounded me-2 p-0 d-flex align-items-center
                    justify-content-center"
                    type="button"
                    style={{width: "50px", height: "90%"}}
                // onClick={() => changeWeek(
                //     // week_info?.previous_week_data.week,
                //     // week_info?.previous_week_data.year
                // )}
                    disabled={weekData?.isLoading}
            >
                <i className="fas fa-angle-double-left fs-3"/>
            </button>


            <div className="fw-bold"
                 style={{fontSize: "14px"}}
            >
                {weekData?.isLoading
                    ? <Skeleton rounded height={'3vh'} width={'100%'}/>
                    :
                    <>
                        {getWeekString()}
                    </>
                }
            </div>

            <button className="btn btn-dark btn-sm fw-bold rounded ms-2 p-0 d-flex align-items-center
                    justify-content-center"
                    type="button"
                    style={{width: "50px", height: "90%"}}
                    disabled={weekData?.isLoading}
            >
                <i className="fas fa-angle-double-right fs-3"/>
            </button>

            <div className={'bg-dark rounded d-flex align-items-center justify-content-center ms-2'}
                 style={{
                     width: "40px",
                     height: "90%",
                     touchAction: 'none',
                     cursor: 'grab',
                 }}
                 ref={drag}
            >
                <i className="fas fa-compress-alt text-light fs-3"/>
            </div>
        </div>
    );
});