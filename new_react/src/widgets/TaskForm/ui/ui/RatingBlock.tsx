import {Box, Rating} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

import {getUrgencyText, Task, TaskUrgency, UpdateTask} from "@entities/Task";
import {useMemo} from "react";

interface RatingBlockProps {
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    task?: Task;
    formTask: UpdateTask;
    disabled: boolean;
}

export const RatingBlock = (props: RatingBlockProps) => {
    const {disabled, task, formTask, setFormDataClb} = props;

    const getLabelText = (value: TaskUrgency) => {
        return `Срочность: ${getUrgencyText(value)}`;
    }

    const onChangeClb = (option: number | null) => {
        if (option) {
            setFormDataClb('urgency', String(option) as TaskUrgency)
        } else {
            setFormDataClb('urgency', TaskUrgency.Normal)
        }
    }

    const getValue = useMemo(() => {
        if (formTask.urgency) {
            return Number(formTask.urgency)
        } else if (task?.urgency) {
            return Number(task.urgency)
        } else {
            return Number(TaskUrgency.Normal)
        }
    }, [formTask.urgency, task?.urgency])

    return (
        <Box
            sx={{
                width: 180,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Rating
                disabled={disabled}
                name="hover-feedback"
                value={getValue}
                max={4}
                getLabelText={option => getLabelText(String(option) as TaskUrgency)}
                onChange={(event, newValue) => onChangeClb(newValue)}
                emptyIcon={<StarIcon style={{opacity: 0.55}} fontSize="inherit"/>}
            />

            <Box className={'fs-7'} sx={{ml: 2}}>
                {getLabelText(formTask.urgency || task?.urgency || TaskUrgency.Normal)}
            </Box>
        </Box>
    );
};
