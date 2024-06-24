import {Box, Rating} from "@mui/material";
import {getUrgencyText, TaskUrgency} from "@pages/TaskPage";
import StarIcon from "@mui/icons-material/Star";
import {CreateTask} from "@widgets/TaskForm/model/types";

interface RatingBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}

export const RatingBlock = (props: RatingBlockProps) => {
    const {disabled, formTask, setFormTask} = props;

    const getLabelText = (value: TaskUrgency) => {
        return `Срочность: ${getUrgencyText(value)}`;
    }

    return (
        <Box
            sx={{
                width: 200,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box className={'fs-7'} sx={{ml: 2}}>
                {getLabelText(formTask.urgency)}
            </Box>
            <Rating
                disabled={disabled}
                name="hover-feedback"
                value={Number(formTask.urgency)}
                max={4}
                getLabelText={option => getLabelText(String(option) as TaskUrgency)}
                onChange={(event, newValue) => {
                    setFormTask({
                        ...formTask,
                        urgency: String(newValue) as TaskUrgency || TaskUrgency.Normal
                    })
                }}
                emptyIcon={<StarIcon style={{opacity: 0.55}} fontSize="inherit"/>}
            />
        </Box>
    );
};
