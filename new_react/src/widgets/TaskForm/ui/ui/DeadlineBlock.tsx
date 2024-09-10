import React, {ChangeEvent, useMemo, useState} from "react";
import {InputGroup} from "react-bootstrap";
import ClearIcon from "@mui/icons-material/Clear";
import {UpdateTask} from "@entities/Task";


interface DeadlineBlockProps {
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    deadline: string | null;
    disabled: boolean;
}


export const DeadlineBlock = (props: DeadlineBlockProps) => {
    const {setFormDataClb, deadline, disabled} = props;

    const [initialDate, initialTime] = useMemo(() => {
        if (deadline) {
            const [datePart, timePart] = deadline.split("T");
            const time = timePart?.slice(0, 5); // Удаляем секунды и смещение часового пояса
            return [datePart, time];
        }
        return ["", ""];
    }, [deadline]);

    const [date, setDate] = useState<string>(initialDate || "");
    const [time, setTime] = useState<string>(initialTime || "");

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        if (!time) {
            setTime("18:00");
        }
        const newDeadline = `${e.target.value}T${time||"18:00"}`;
        setFormDataClb('deadline', newDeadline);
    };

    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
        const newDeadline = `${date}T${e.target.value}`;
        setFormDataClb('deadline', newDeadline);
    };

    const clearHandler = () => {
        setDate("");
        setTime("");
        setFormDataClb('deadline', null)
    }

    return (
        <InputGroup className={'d-flex flex-nowrap w-100'}>
            <InputGroup.Text style={{width: '120px'}} className={'fs-7'}>
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
                style={{minWidth: '140px'}}
                type="date"
                value={date}
                disabled={disabled}
                onChange={handleDateChange}
            />
            <input
                className={'fs-7'}
                style={{minWidth: '100px'}}
                type="time"
                value={time}
                disabled={disabled}
                onChange={handleTimeChange}
            />
        </InputGroup>
    );
};
