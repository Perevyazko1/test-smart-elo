import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {getViewModeText, TaskViewMode} from "@pages/TaskPage";

interface ViewModeBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}


export const ViewModeBlock = (props: ViewModeBlockProps) => {
    const {formTask, setFormTask, disabled} = props;

    const handleChange = (event: SelectChangeEvent<TaskViewMode>) => {
        const selectedValue = event.target.value as TaskViewMode;
        console.log(typeof selectedValue)
        setFormTask({
            ...formTask,
            view_mode: selectedValue,
        });
    };

    const taskViewModeOptions = Object.values(TaskViewMode).map((value) => ({
        value,
        label: getViewModeText(value as TaskViewMode),
    }));

    return (
        <FormControl sx={{
            width: 200
        }}>
            <InputLabel id="view-mode-select-label">Видимость</InputLabel>
            <Select
                readOnly={disabled}
                size="small"
                value={formTask.view_mode}
                label="Видимость"
                onChange={handleChange}
                variant="standard"
            >
                {taskViewModeOptions.map((option) => (
                    <MenuItem value={option.value} key={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
