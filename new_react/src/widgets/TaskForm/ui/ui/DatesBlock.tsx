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
                <InputGroup.Text style={{width: '150px'}} className={'text-muted fs-7'}>
                    Создана:
                </InputGroup.Text>
                <input
                    type="datetime-local"
                    disabled
                    value={convertDateTime(task?.created_at)}
                />
            </InputGroup>


            <InputGroup>
                <InputGroup.Text style={{width: '150px'}} className={'text-muted fs-7'}>
                    Готова:
                </InputGroup.Text>
                <input
                    type="datetime-local"
                    disabled
                    value={convertDateTime(task?.ready_at)}
                />
            </InputGroup>
            <InputGroup>
                <InputGroup.Text style={{width: '150px'}} className={'text-muted fs-7'}>
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
