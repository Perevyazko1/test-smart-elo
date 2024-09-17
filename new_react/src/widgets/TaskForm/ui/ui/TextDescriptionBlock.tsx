import React from "react";

import {Task, UpdateTask} from "@entities/Task";
import {AppVoiceInput} from "@shared/ui";


interface TextDescriptionBlockProps {
    task?: Task;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    disabled: boolean;
}

export const TextDescriptionBlock = (props: TextDescriptionBlockProps) => {
    const { formTask, setFormDataClb, disabled, task } = props;

    const handleInputChange = (newValue: string) => {
        setFormDataClb('description', newValue || null);
    };

    return (
        <AppVoiceInput
            asTextarea
            disabled={disabled}
            setValue={handleInputChange}
            value={formTask.description || task?.description || ""}
            label={'Описание'}
        />
    );
};
