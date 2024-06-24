import React, {useContext, useEffect, useMemo} from "react";
import {Button} from "react-bootstrap";
import {ConnectDragSource} from "react-dnd";

import {IsDesktopContext} from "@app";
import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser, useDoubleTap} from "@shared/hooks";

import {eqFiltersReady, getWeekData} from "../../model/selectors/filterSelectors";
import {fetchWeekData} from "../../model/api/fetchWeekData";

interface EqWeeksProps {
    blockWidthPx: number;
    isDragging: boolean;
    showClb: () => void;
    drag: ConnectDragSource;
    resetSize: () => void;
}

export const EqWeeks = (props: EqWeeksProps) => {
    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam} = useAppQuery();
    const filtersReady = useAppSelector(eqFiltersReady);

    const {blockWidthPx, isDragging, showClb, drag, resetSize} = props;
    const isDesktop = useContext(IsDesktopContext);
    const handleDoubleTap = useDoubleTap(resetSize);
    const weekData = useAppSelector(getWeekData);

    useEffect(() => {
        if (weekData?.hasUpdated !== undefined && filtersReady) {
            dispatch(fetchWeekData({
                department_id: currentUser.current_department.id,
                ...queryParameters
            }))
        }
        // eslint-disable-next-line
    }, [
        dispatch,
        filtersReady,
        queryParameters.week,
        queryParameters.project,
        queryParameters.view_mode,
        weekData?.hasUpdated,
        currentUser.current_department
    ]);

    const getEarnedSum = useMemo(() => weekData?.earned || "0", [weekData?.earned])

    const getWeekString = () => {
        if (blockWidthPx > 650) {
            return `Неделя ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''} 
            по ${weekData?.str_dates ? weekData.str_dates[6] : ''}   | ЗП: ${getEarnedSum}`;
        } else if (blockWidthPx > 550) {
            return `Нед. ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''} 
            по ${weekData?.str_dates ? weekData.str_dates[6] : ''}   | ЗП: ${getEarnedSum}`;
        } else if (blockWidthPx > 400) {
            return `Нед. ${weekData?.week} | ЗП: ${getEarnedSum}`;
        } else if (blockWidthPx > 300) {
            return `Нед. ${weekData?.week}`;
        } else if (blockWidthPx > 250) {
            return `${weekData?.week}`;
        } else {
            return '';
        }
    }

    return (
        <div
            className={'d-flex justify-content-between align-items-center px-2 rounded border border-1'}
            style={{
                height: '36px',
                backgroundColor: currentUser.current_department.color || '#ffffff',
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            {!isDesktop &&
                <div className={'bg-dark rounded d-flex align-items-center justify-content-center me-2'}
                     style={{
                         width: "40px",
                         height: "90%",
                         cursor: 'pointer',
                     }}
                     onClick={showClb}
                >
                    <i className="fas fa-filter text-light fs-6"/>
                </div>
            }

            <div className={'d-flex justify-content-between flex-fill align-items-center'}>
                <Button className={"me-2 p-0 d-flex align-items-center justify-content-center"}
                        variant={'dark'}
                        size={'sm'}
                        style={{width: "50px", height: "29px"}}
                        onClick={() => setQueryParam('week', `${weekData?.previous_week_data?.week}`)}
                >
                    <i className="fas fa-angle-double-left fs-3"/>
                </Button>

                <div>
                    {getWeekString()}
                </div>


                <Button className={"ms-2 p-0 d-flex align-items-center justify-content-center"}
                        type={"button"}
                        variant={'dark'}
                        size={'sm'}
                        style={{width: "50px", height: "29px"}}
                        onClick={() => setQueryParam('week', `${weekData?.next_week_data?.week}`)}
                >
                    <i className="fas fa-angle-double-right fs-3"/>
                </Button>
            </div>

            {!!drag &&
                <div className={'bg-dark rounded rounded-1 d-flex align-items-center justify-content-center ms-2'}
                     style={{
                         width: "40px",
                         height: "29px",
                         touchAction: 'none',
                         cursor: 'grab',
                     }}
                     ref={drag}
                     onDoubleClick={resetSize}
                     onTouchEnd={handleDoubleTap}
                >
                    {isDragging ? <i className="far fa-hand-rock fs-5 text-light"/>
                        : <i className="far fa-hand-paper fs-5 text-light"/>
                    }
                </div>
            }
        </div>
    )
}