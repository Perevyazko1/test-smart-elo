import React, {ChangeEvent} from "react";
import {InputGroup} from "react-bootstrap";
import {CreateTask} from "@widgets/TaskForm/model/types";

interface DeadlineBlockProps {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    formData: CreateTask;
    disabled: boolean;
}


export const DeadlineBlock = (props: DeadlineBlockProps) => {
    const {onChange, formData, disabled} = props;

    return (
        <InputGroup>
            <InputGroup.Text style={{width: '150px'}} >
                Крайний срок:
            </InputGroup.Text>
            <input
                type="datetime-local"
                name={"deadline"}
                value={formData.deadline}
                disabled={disabled}
                onChange={onChange}
            />
        </InputGroup>
    );
};
