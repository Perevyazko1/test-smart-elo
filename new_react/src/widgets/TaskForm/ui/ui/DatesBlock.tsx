import {InputGroup} from "react-bootstrap";
import React, {ChangeEvent} from "react";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {Task} from "@pages/TaskPage";
import {convertDateTime} from "@shared/lib";

interface DatesBlockProps {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    task?: Task;
    formData: CreateTask;
    disabled: boolean;
}


export const DatesBlock = (props: DatesBlockProps) => {
    const {onChange, formData, disabled, task} = props;

    return (
        <div>
            <InputGroup>
                <InputGroup.Text>
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
            <hr/>

            <InputGroup>
                <InputGroup.Text style={{width: '150px'}} className={'text-muted'}>
                    Создана:
                </InputGroup.Text>
                <input
                    type="datetime-local"
                    disabled
                    value={convertDateTime(task?.created)}
                />
            </InputGroup>

            <InputGroup>
                <InputGroup.Text style={{width: '150px'}} className={'text-muted'}>
                    Готова:
                </InputGroup.Text>
                <input
                    type="datetime-local"
                    disabled
                    value={convertDateTime(task?.ready_at)}
                />
            </InputGroup>
            <InputGroup>
                <InputGroup.Text style={{width: '150px'}} className={'text-muted'}>
                    Завизирована:
                </InputGroup.Text>
                <input
                    type="datetime-local"
                    disabled
                    value={convertDateTime(task?.verified_at)}
                />
            </InputGroup>
        </div>
    );
};
