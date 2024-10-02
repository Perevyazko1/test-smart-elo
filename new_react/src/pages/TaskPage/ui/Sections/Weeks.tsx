import React, {useContext, useEffect} from "react";

import {ConnectDragSource} from "react-dnd";
import {Button} from "react-bootstrap";
import {Fab} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import {IsDesktopContext} from "@app";
import {TaskForm} from "@widgets/TaskForm";
import {getHumansDatetime} from "@shared/lib";
import {useAppDispatch, useAppModal, useAppQuery, useAppSelector, useDoubleTap} from "@shared/hooks";

import {getReadyData, getStateDateRangeData} from "../../model/selectors";
import {getDateRangeData} from "../../model/api/getDateRangeData";


interface WeeksProps {
    blockWidthPx: number;
    drag: ConnectDragSource;
    isDragging: boolean;
    resetSize: () => void;
    setShowNavbar: () => void;
}


export const Weeks = (props: WeeksProps) => {
    const {drag, isDragging, resetSize, setShowNavbar, blockWidthPx} = props;
    const {handleOpen, closeNoConfirm} = useAppModal();
    const handleDoubleTap = useDoubleTap(resetSize);
    const isDesktop = useContext(IsDesktopContext);
    const dispatch = useAppDispatch();

    const readyData = useAppSelector(getReadyData);

    const {initialLoad, queryParameters, setQueryParam} = useAppQuery();

    const dateRangeData = useAppSelector(getStateDateRangeData);

    const addAction = () => handleOpen(
        <TaskForm
            variant={'create'}
            onSubmitClb={closeNoConfirm}
        />,
        true
    );

    useEffect(() => {
        if (!initialLoad) {
            dispatch(getDateRangeData({
                start_date: queryParameters.start_date,
                end_date: queryParameters.end_date,
            }))
        }
    }, [dispatch, initialLoad, queryParameters.start_date, queryParameters.end_date]);


    const getWeekString = () => {
        if (dateRangeData) {
            if (blockWidthPx > 550) {
                return (
                    `${dateRangeData.range_type} ${dateRangeData.range_value} 
                    с ${getHumansDatetime(dateRangeData.date_range.start_date, 'DD-MM')} 
                    по ${getHumansDatetime(dateRangeData.date_range.end_date, 'DD-MM')}
                    (${readyData?.results.length})
                    `
                );

            } else if (blockWidthPx > 400) {
                return (
                    `${dateRangeData.range_type} ${dateRangeData.range_value}`
                );
            } else if (blockWidthPx > 250) {
                return (
                    `${dateRangeData.range_value}`
                );
            } else {
                return ('');
            }
        } else {
            return ("");
        }
    }


    return (
        <div
            className={'d-flex justify-content-between px-1 align-items-center gap-1 rounded border border-1 w-100'}
            style={{
                height: '36px',
                backgroundColor: '#ffffff',
                maxWidth: '1300px',
            }}
        >

            <div className={'d-flex align-items-center h-100 gap-1'}>
                {!isDesktop &&
                    <div className={'bg-dark rounded d-flex align-items-center justify-content-center'}
                         style={{
                             width: "40px",
                             height: "90%",
                             cursor: 'pointer',
                         }}
                         onClick={setShowNavbar}
                    >
                        <i className="fas fa-filter text-light fs-6"/>
                    </div>
                }

                <Fab size="small" color="inherit" aria-label="add" onClick={addAction}>
                    <AddIcon/>
                </Fab>
            </div>

            {(dateRangeData && blockWidthPx > 300) &&
                <div className={'d-flex gap-1 justify-content-between flex-fill align-items-center'}>
                    <Button className={"p-0 d-flex align-items-center justify-content-center"}
                            variant={'dark'}
                            size={'sm'}
                            style={{width: "50px", height: "29px"}}
                            onClick={() => {
                                setQueryParam(
                                    'start_date',
                                    getHumansDatetime(
                                        `${dateRangeData?.previous_range.start_date}`,
                                        "YYYY-MM-DD"
                                    )
                                )
                                setQueryParam(
                                    'end_date',
                                    getHumansDatetime(
                                        `${dateRangeData?.previous_range.end_date}`,
                                        "YYYY-MM-DD"
                                    )
                                )
                            }}
                    >
                        <i className="fas fa-angle-double-left fs-3"/>
                    </Button>

                    <div>
                        {getWeekString()}
                    </div>

                    <Button className={"p-0 d-flex align-items-center justify-content-center"}
                            type={"button"}
                            variant={'dark'}
                            size={'sm'}
                            style={{width: "50px", height: "29px"}}
                            onClick={() => {
                                setQueryParam(
                                    'start_date',
                                    getHumansDatetime(
                                        `${dateRangeData?.next_range.start_date}`,
                                        "YYYY-MM-DD"
                                    )
                                )
                                setQueryParam(
                                    'end_date',
                                    getHumansDatetime(
                                        `${dateRangeData?.next_range.end_date}`,
                                        "YYYY-MM-DD"
                                    )
                                )
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
                         cursor: isDragging ? "grabbing" : 'grab',
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
    );
};
