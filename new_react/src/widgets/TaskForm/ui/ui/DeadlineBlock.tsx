import React, {ChangeEvent, useEffect, useMemo, useState} from "react";
import {InputGroup} from "react-bootstrap";
import {CreateTask} from "@widgets/TaskForm/model/types";
import ClearIcon from "@mui/icons-material/Clear";

interface DeadlineBlockProps {
    setFormTask: (task: CreateTask) => void;
    formData: CreateTask;
    disabled: boolean;
}


export const DeadlineBlock = (props: DeadlineBlockProps) => {
    const {setFormTask, formData, disabled} = props;

    const [initialDate, initialTime] = useMemo(() => {
        return formData.deadline ? formData.deadline.split("T") : ["", ""];
    }, [formData.deadline]);

    const [date, setDate] = useState<string>(initialDate || "");
    const [time, setTime] = useState<string>(initialTime || "");

    useEffect(() => {
        if (date) {
            const newTime = time || "18:00";
            const newDeadline = `${date}T${newTime}`;

            if (formData.deadline !== newDeadline) {
                setFormTask({
                    ...formData,
                    deadline: newDeadline
                });
            }
        }
        //eslint-disable-next-line
    }, [date, formData.deadline, time]);

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        if (!time) {
            setTime("18:00");
        }
    };

    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
    };

    const clearHandler = () => {
        setDate("");
        setTime("");
        setFormTask({
            ...formData,
            deadline: ""
        });
    }

    return (
        <InputGroup>
            <InputGroup.Text style={{width: '118px'}} className={'fs-7'}>
                Крайний срок:
                {date && !disabled &&
                    <button
                        className={'appBtn border-1 border-secondary text-secondary flex-fill ms-1 fs-7'}
                        type={'button'}
                        style={{
                            borderRadius: '50%',
                            padding: '.1rem'
                        }}
                        onClick={clearHandler}
                    >
                        <ClearIcon fontSize={'inherit'} className={'text-secondary fs-7'}/>
                    </button>
                }
            </InputGroup.Text>
            <input
                className={'fs-7'}
                style={{width: '140px'}}
                type="date"
                value={date}
                disabled={disabled}
                onChange={handleDateChange}
            />
            <input
                className={'fs-7'}
                style={{width: '100px'}}
                type="time"
                value={time}
                disabled={disabled}
                onChange={handleTimeChange}
            />
        </InputGroup>
    );
};
