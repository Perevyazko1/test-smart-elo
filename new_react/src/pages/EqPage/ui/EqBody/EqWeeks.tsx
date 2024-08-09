import React, {useContext, useEffect, useMemo} from "react";
import {Button, Table} from "react-bootstrap";
import {ConnectDragSource} from "react-dnd";
import {motion} from "framer-motion";

import {IsDesktopContext} from "@app";
import {useAppDispatch, useAppModal, useAppQuery, useAppSelector, useCurrentUser, useDoubleTap} from "@shared/hooks";

import {eqFiltersReady, getWeekData} from "../../model/selectors/filterSelectors";
import {fetchWeekData} from "../../model/api/fetchWeekData";
import {AppSkeleton} from "@shared/ui";
import {DayDetail} from "@pages/WagesPage/ui/WagesWeek/DayDetail";
import {Transaction} from "@entities/Transaction";
import {TransactionInfo} from "@pages/EqPage/ui/EqBody/TransactionInfo";

interface EqWeeksProps {
    rightBlockWidth: number;
    leftBlockWidth: number;
    showClb: () => void;
    drag: ConnectDragSource;
    isDragging: boolean;
    resetSize: () => void;
    expanded: boolean;
    inWorkHeight: number;
    durationValue: number;
}

export const EqWeeks = (props: EqWeeksProps) => {
    const {
        leftBlockWidth,
        rightBlockWidth,
        isDragging,
        showClb,
        drag,
        resetSize,
        expanded,
        inWorkHeight,
        durationValue,
    } = props;

    const blockWidthPx = expanded ? rightBlockWidth : leftBlockWidth;

    const dispatch = useAppDispatch();
    const {handleOpen} = useAppModal();
    const {currentUser} = useCurrentUser();
    const {queryParameters, setQueryParam} = useAppQuery();
    const filtersReady = useAppSelector(eqFiltersReady);

    const isDesktop = useContext(IsDesktopContext);
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

    useEffect(() => {

    }, [queryParameters.view_mode])

    const wagesBtn = useMemo(() => {
        const viewMode = queryParameters.view_mode;
        let useId = currentUser.id
        if (!isNaN(Number(viewMode))) {
            useId = Number(viewMode)
        }
        return (
            weekData ?
                <button
                    className={'appBtn rounded px-1 mx-1 p-0'}
                    style={{
                        backgroundColor: currentUser.current_department?.color || '#ffffff',
                        lineHeight: '12px'
                    }}
                    onClick={() => handleOpen(
                        <Table bordered striped hover>
                            <tbody>
                            <DayDetail
                                onClick={(transaction: Transaction) =>
                                    handleOpen(<TransactionInfo transaction={transaction}/>)
                                }
                                employeeId={useId}
                                startDate={weekData.dt_dates[0].slice(0, 10) || ""}
                                endDate={weekData.dt_dates[6].slice(0, 10) || ""}
                            />
                            </tbody>
                        </Table>
                    )}
                >
                    {getEarnedSum}
                </button>
                :
                <></>
        )
    }, [
        currentUser.current_department?.color,
        currentUser.id,
        getEarnedSum,
        handleOpen,
        queryParameters.view_mode,
        weekData
    ]);

    const getWeekString = useMemo(() => {
        if (blockWidthPx > 650) {
            return (
                <>
                    {`Неделя ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''}
                    по ${weekData?.str_dates ? weekData.str_dates[6] : ''} | ЗП: `}
                    {wagesBtn}
                </>
            );
        } else if (blockWidthPx > 550) {
            return (
                <>
                    {
                        `Нед. ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''} по 
                        ${weekData?.str_dates ? weekData.str_dates[6] : ''} | ЗП: `
                    }
                    {wagesBtn}
                </>
            );
        } else if (blockWidthPx > 400) {
            return (
                <>
                    {
                        `Нед. ${weekData?.week} | ЗП: `
                    }
                    {wagesBtn}
                </>
            );
        } else if (blockWidthPx > 300) {
            return `Нед. ${weekData?.week}`;
        } else if (blockWidthPx > 250) {
            return `${weekData?.week}`;
        } else {
            return '';
        }
    }, [blockWidthPx, wagesBtn, weekData?.str_dates, weekData?.week])

    return (
        <motion.div
            className={`d-flex justify-content-${expanded ? "start" : "end"} align-items-center px-1 gap-1 rounded border border-1 `}
            style={{
                height: '36px',
                backgroundColor: currentUser.current_department?.color || '#ffffff',
                opacity: isDragging ? 0.5 : 1,
                width: blockWidthPx,
                maxWidth: '1200px',
                position: 'absolute',
                top: `${inWorkHeight}px`,
                ...(expanded ? {left: leftBlockWidth} : {right: rightBlockWidth}),
            }}
            initial={{
                left: expanded ? leftBlockWidth : 0,
                right: expanded ? 0 : rightBlockWidth,
            }}
            animate={{
                ...(expanded ? {left: leftBlockWidth} : {right: rightBlockWidth}),
            }}
            transition={{duration: durationValue}}
        >
            {!isDesktop &&
                <div className={'bg-dark rounded d-flex align-items-center justify-content-center'}
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

                    <div className={'d-flex flex-fill justify-content-center'}>
                        {!weekData?.isLoading ?
                            <>
                                {getWeekString}
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
        </motion.div>
    )
}