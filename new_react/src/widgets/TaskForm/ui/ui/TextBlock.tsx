import {CreateTask} from "@widgets/TaskForm/model/types";
import {Form, InputGroup} from "react-bootstrap";
import React from "react";

interface TextBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}

export const TextBlock = (props: TextBlockProps) => {
    const {formTask, setFormTask, disabled} = props;

    return (
        <>
            <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">
                    Название<b className={'text-danger fs-5'}>*</b>:
                </InputGroup.Text>
                <Form.Control
                    required
                    readOnly={disabled}
                    value={formTask.title}
                    onChange={(e) => setFormTask({
                        ...formTask,
                        title: e.target.value,
                    })}
                />
            </InputGroup>

            <InputGroup className={'mb-3'}>
                <InputGroup.Text>
                    Описание:
                </InputGroup.Text>
                <Form.Control as="textarea"
                              readOnly={disabled}
                              value={formTask.description}
                              onChange={(e) => setFormTask({
                                  ...formTask,
                                  description: e.target.value,
                              })}/>
            </InputGroup>

        </>
    );
};
