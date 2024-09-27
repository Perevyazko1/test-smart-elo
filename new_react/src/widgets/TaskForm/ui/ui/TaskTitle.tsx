import {getStatusText, Task} from "@entities/Task";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import React from "react";
import {useEmployeeName} from "@shared/hooks";
import {Tooltip} from "@mui/material";
import {getHumansDatetime} from "@shared/lib";

interface TaskTitleProps {
    task?: Task;
}

export const TaskTitle = (props: TaskTitleProps) => {
    const {task} = props;

    const {getNameById} = useEmployeeName();

    if (task) {
        return (
            <div>
                <div className={'fs-5'}>
                    Задача № {task.id} (статус: {getStatusText(task.status)})
                </div>
                <div className={'d-flex align-items-center gap-1'} style={{fontSize: 10}}>
                    <VisibilityOutlinedIcon fontSize={'small'} sx={{transform: 'scale(0.8)'}}/>
                    {task.task_view_info.map(item => (
                        <Tooltip
                            arrow
                            title={
                                `${getNameById(item.employee, 'listNameInitials')} ${getHumansDatetime(item.last_date)}`
                            }
                            key={item.id}
                        >
                            <div className={'fw-bold'}>
                                {getNameById(item.employee, 'initials')} |
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <h4>Новая задача</h4>
    );
};
