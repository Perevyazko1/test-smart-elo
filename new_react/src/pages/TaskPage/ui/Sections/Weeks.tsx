import React, {useEffect} from "react";

import {Button} from "react-bootstrap";
import {Fab} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import {useAppDispatch, useAppModal, useAppQuery, useAppSelector} from "@shared/hooks";
import {TaskForm} from "@widgets/TaskForm";

import {getStateWeekData} from "../../model/selectors";
import {getWeekData} from "../../model/api/getWeekData";


export const Weeks = () => {
    const {openModal, closeModal} = useAppModal();
    const dispatch = useAppDispatch();
    const {initialLoad, queryParameters, setQueryParam} = useAppQuery();

    const weekData = useAppSelector(getStateWeekData);

    const addAction = () => {
        openModal(
            <TaskForm
                variant={'create'}
                onSubmitClb={() => {
                    closeModal()
                }}
            />
        )
    }

    useEffect(() => {
        if (!initialLoad) {
            dispatch(getWeekData({
                week: queryParameters.week,
                year: queryParameters.year
            }))
        }
    }, [dispatch, initialLoad, queryParameters.week, queryParameters.year])


    return (
        <div
            className={'d-flex justify-content-between align-items-center px-2 rounded border border-1'}
            style={{
                height: '36px',
                backgroundColor: '#ffffff',
            }}
        >

            <div className={'d-flex justify-content-between flex-fill align-items-center'}>
                <Button className={"me-2 p-0 d-flex align-items-center justify-content-center"}
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
                    {`Неделя ${weekData?.week} с ${weekData?.str_dates ? weekData.str_dates[0] : ''} 
                        по ${weekData?.str_dates ? weekData.str_dates[6] : ''}`}
                </div>


                <Button className={"ms-2 p-0 d-flex align-items-center justify-content-center"}
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
            <div className={'ms-3'}>
                <Fab size="small" color="inherit" aria-label="add" onClick={addAction}>
                    <AddIcon/>
                </Fab>
            </div>

        </div>
    );
};
