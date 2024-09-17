import React from "react";

import {Task, UpdateTask} from "@entities/Task";
import {AppVoiceInput} from "@shared/ui";


interface TextTitleBlockProps {
    task?: Task;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    disabled: boolean;
}

export const TextTitleBlock = (props: TextTitleBlockProps) => {
    const {formTask, setFormDataClb, disabled, task} = props;

    const handleInputChange = (newValue: string) => {
        setFormDataClb('title', newValue);
    };

    return (
        <AppVoiceInput
            disabled={disabled}
            setValue={handleInputChange}
            value={formTask.title || task?.title || ""}
            label={'Название'}
            required
        />
    );
};
