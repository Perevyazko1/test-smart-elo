import {InputGroup} from "react-bootstrap";
import React from "react";
import {Task} from "@pages/TaskPage";
import {convertDateTime} from "@shared/lib";

interface DatesBlockProps {
    task?: Task;
}


export const DatesBlock = (props: DatesBlockProps) => {
    const {task} = props;

    return (
        <div>

            <InputGroup>
                <InputGroup.Text style={{width: '150px'}} className={'text-muted'}>
                    Создана:
                </InputGroup.Text>
                <input
                    type="datetime-local"
                    disabled
                    value={convertDateTime(task?.created_at)}
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
