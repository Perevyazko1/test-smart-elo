import {CreateTask} from "@widgets/TaskForm/model/types";
import {getViewModeText, TaskViewMode} from "@pages/TaskPage";
import {AppSelect} from "@shared/ui";

interface ViewModeBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}


export const ViewModeBlock = (props: ViewModeBlockProps) => {
    const {formTask, setFormTask, disabled} = props;

    const handleChange = (selectedValue: TaskViewMode) => {
        setFormTask({
            ...formTask,
            view_mode: selectedValue,
        });
    };

    return (
        <AppSelect
            bordered
            label={"Видимость"}
            variant={'dropdown'}
            colorScheme={'lightInput'}
            style={{width: 200}}
            readOnly={disabled}
            value={formTask.view_mode}
            options={Object.values(TaskViewMode)}
            getOptionLabel={option => getViewModeText(option)}
            onSelect={handleChange}
        />
    )
};
