import React, {useContext, useEffect} from "react";

import {Button} from "react-bootstrap";
import {Fab} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import {useAppDispatch, useAppModal, useAppQuery, useAppSelector, useDoubleTap} from "@shared/hooks";
import {TaskForm} from "@widgets/TaskForm";

import {getStateWeekData} from "../../model/selectors";
import {getWeekData} from "../../model/api/getWeekData";
import {ConnectDragSource} from "react-dnd";
import {IsDesktopContext} from "@app";


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
    const {initialLoad, queryParameters, setQueryParam} = useAppQuery();

    const weekData = useAppSelector(getStateWeekData);

    const addAction = () => handleOpen(
        <TaskForm
            variant={'create'}
            onSubmitClb={closeNoConfirm}
        />,
        true
    );

    useEffect(() => {
        if (!initialLoad) {
            dispatch(getWeekData({
                week: queryParameters.week,
                year: queryParameters.year
            }))
        }
    }, [dispatch, initialLoad, queryParameters.week, queryParameters.year]);


    const getWeekString = () => {
        if (blockWidthPx > 550) {
            return `Неделя ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''} 
                        по ${weekData?.str_dates ? weekData.str_dates[6] : ''}`;
        } else if (blockWidthPx > 400) {
            return `Неделя ${weekData?.week}`;
        } else if (blockWidthPx > 250) {
            return `${weekData?.week}`;
        } else {
            return '';
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

            {blockWidthPx > 300 &&
                <div className={'d-flex gap-1 justify-content-between flex-fill align-items-center'}>
                    <Button className={"p-0 d-flex align-items-center justify-content-center"}
                            variant={'dark'}
                            size={'sm'}
                            style={{width: "50px", height: "29px"}}
                            onClick={() => {
                                setQueryParam('week', `${weekData?.previous_week_data?.week}`)
                                setQueryParam('year', `${weekData?.previous_week_data?.year}`)
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
