import React, {useEffect, useMemo} from "react";
import {Button} from "react-bootstrap";
import {ConnectDragSource} from "react-dnd";

import {useAppDispatch, useAppModal, useAppQuery, useAppSelector, useCurrentUser, useDoubleTap,} from "@shared/hooks";
import {AppSkeleton} from "@shared/ui";

import {eqFiltersReady, getWeekData} from "../../model/selectors/filterSelectors";
import {fetchWeekData} from "../../model/api/fetchWeekData";

import {WagesInfo} from "./WagesInfo";


interface EqWeeksProps {
    inWorkHeight: number;
    rightBlockWidth: number;
    leftBlockWidth: number;
    drag: ConnectDragSource;
    resetSize: () => void;
    expanded: boolean;
}


export const EqWeeks = (props: EqWeeksProps) => {
    const {
        inWorkHeight,
        leftBlockWidth,
        rightBlockWidth,
        drag,
        resetSize,
        expanded,
    } = props;

    const {handleOpen} = useAppModal();

    const blockWidthPx = expanded ? rightBlockWidth : leftBlockWidth;

    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam} = useAppQuery();
    const filtersReady = useAppSelector(eqFiltersReady);

    const handleDoubleTap = useDoubleTap(resetSize);
    const weekData = useAppSelector(getWeekData);

    useEffect(() => {
        if (weekData?.hasUpdated !== undefined && filtersReady && currentUser.current_department) {
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

    const getEarnedSum = useMemo(() => weekData?.earned || "0", [weekData?.earned]);

    const targetUserId = useMemo<number>(() => {
        if (queryParameters.view_mode) {
            if (!['boss', 'unfinished', 'distribute'].includes(queryParameters.view_mode)) {
                return Number(queryParameters.view_mode);
            }
        }
        return currentUser.id;
    }, [currentUser.id, queryParameters.view_mode]);

    const handleOpenWages = () => {
        handleOpen(
            <WagesInfo
                employeeId={targetUserId}
                endDate={weekData?.dt_dates[6] || ''}
                startDate={weekData?.dt_dates[0] || ''}
            />
        );
    }

    const getWeekString = useMemo(() => {
        if (blockWidthPx > 650) {
            return (
                <>
                    {`Неделя ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''}
                    по ${weekData?.str_dates ? weekData.str_dates[6] : ''} | ЗП: `}
                </>
            );
        } else if (blockWidthPx > 550) {
            return (
                <>
                    {
                        `Нед. ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''} по 
                        ${weekData?.str_dates ? weekData.str_dates[6] : ''} | ЗП: `
                    }
                </>
            );
        } else if (blockWidthPx > 400) {
            return (
                <>
                    {
                        `Нед. ${weekData?.week} | ЗП: `
                    }
                </>
            );
        } else if (blockWidthPx > 300) {
            return `Нед. ${weekData?.week}`;
        } else if (blockWidthPx > 250) {
            return `${weekData?.week}`;
        } else {
            return '';
        }
    }, [blockWidthPx, weekData?.str_dates, weekData?.week]);

    return (

        <div
            style={{
                position: 'absolute',
                top: inWorkHeight,
                ...(expanded ? {left: leftBlockWidth} : {right: rightBlockWidth}),
                width: expanded ? rightBlockWidth : leftBlockWidth,
                maxWidth: '1200px',
                overflowX: 'hidden',
                overflowY: 'auto',
                height: '36px',
            }}
        >
            <div
                className={`d-flex justify-content-${expanded ? "start" : "end"} align-items-center px-1 gap-1 rounded border border-1 `}
                style={{
                    height: '36px',
                    backgroundColor: currentUser.current_department?.color || '#ffffff',
                    width: blockWidthPx,
                    maxWidth: '1200px',
                    position: 'absolute',
                }}
            >

                {blockWidthPx > 300 &&
                    <div className={'d-flex justify-content-between flex-fill align-items-center gap-1'}>
                        <Button className={"p-0 d-flex align-items-center justify-content-center"}
                                variant={'dark'}
                                size={'sm'}
                                style={{width: "50px", height: "29px"}}
                                disabled={expanded}
                                onClick={() => {
                                    setQueryParam('week', `${weekData?.previous_week_data?.week}`)
                                    setQueryParam('year', `${weekData?.previous_week_data?.year}`)
                                }}
                        >
                            <i className="fas fa-angle-double-left fs-3"/>
                        </Button>

                        <div className={'d-flex flex-fill justify-content-center align-items-center'}>
                            {!weekData?.isLoading ?
                                <>
                                    {getWeekString}
                                    <button
                                        className={'appBtn px-1 rounded mx-1 fs-7'}
                                        onClick={handleOpenWages}
                                    >
                                        {getEarnedSum}
                                    </button>
                                </> :
                                <AppSkeleton className={'h-100 flex-fill'}/>
                            }
                        </div>


                        <Button className={"p-0 d-flex align-items-center justify-content-center"}
                                type={"button"}
                                variant={'dark'}
                                size={'sm'}
                                disabled={expanded}
                                style={{width: "50px", height: "29px"}}
                                onClick={() => {
                                    setQueryParam('week', `${weekData?.next_week_data?.week}`)
                                    setQueryParam('year', `${weekData?.next_week_data?.year}`)
                                }}
                        >
                            <i className="fas fa-angle-double-right fs-3"/>
                        </Button>
                    </div>
                }
                {!!drag &&
                    <div className={'bg-dark rounded rounded-1 d-flex align-items-center justify-content-center'}
                         style={{
                             width: "40px",
                             height: "29px",
                             touchAction: 'none',
                             cursor: 'grab',
                             order: expanded ? "-1" : "1",
                             userSelect: 'none',
                         }}
                         ref={drag}
                         onDoubleClick={resetSize}
                         onTouchEnd={handleDoubleTap}
                    >
                        <i className="far fa-hand-paper fs-5 text-light"/>
                    </div>
                }
            </div>
        </div>
    )
}