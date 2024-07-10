import {CreateTask} from "@widgets/TaskForm/model/types";
import {getViewModeText, TaskViewMode} from "@pages/TaskPage";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";

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
        <AppAutocomplete
            variant={"dropdown"}
            readOnly={disabled}
            value={formTask.view_mode}
            label={"Видимость"}
            options={Object.values(TaskViewMode)}
            getOptionLabel={getViewModeText}
            onChangeClb={handleChange}
            width={200}
        />
    );
};
