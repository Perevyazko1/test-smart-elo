import React, {useState} from "react";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {Task} from "@entities/Task";
import {taskPageActions} from "@pages/TaskPage";
import {useAppDispatch, useCurrentUser, useEmployeeName} from "@shared/hooks";
import {AppSkeleton, AppVoiceInput} from "@shared/ui";
import {getHumansDatetime} from "@shared/lib";

import {useCreateTaskComment, useTaskCommentList} from "../../model/api";
import {Tooltip} from "@mui/material";


interface CommentBlockProps {
    task: Task;
}


export const CommentBlock = (props: CommentBlockProps) => {
    const {task} = props;

    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
    const [inputValue, setInputValue] = useState<string>("");
    const [createTaskComment, {isLoading}] = useCreateTaskComment();

    const {getNameById} = useEmployeeName();

    const {data: comments, isLoading: commentsIsLoading} = useTaskCommentList({task: task.id});

    const createCommentClb = () => {
        if (task?.id) {
            createTaskComment({
                task: task.id,
                author: currentUser.id,
                comment: inputValue,
            }).then(() => {
                setInputValue('')
            }).then(() => {
                dispatch(taskPageActions.addNoRelevantId(task.id));
            })
        }
    };

    return (
        <div className={'flex-fill'}>
            <AppVoiceInput
                isLoading={isLoading}
                setValue={setInputValue}
                value={inputValue}
                label={'Комментарий'}
                onSubmit={createCommentClb}
            />

            <div className={'fs-7 mt-2 p-1 ps-3 w-100'}>
                {(commentsIsLoading || isLoading) &&
                    <AppSkeleton className={'m-1 w-100'} style={{height: '20px'}}/>
                }

                {comments &&
                    <>
                        {comments.length > 0 ?
                            comments.map(comment => (
                                <div key={comment.id} className={'fs-7'}>
                                    <div className={'d-flex align-items-center'}>

                                        {getHumansDatetime(comment.add_date)} | {getNameById(comment.author, 'listNameInitials')} -
                                        <b className={'ms-3'}>{comment.comment}</b>

                                        <div className={'d-flex align-items-center align-self-stretch'}
                                             style={{fontSize: 10}}>
                                            <VisibilityOutlinedIcon
                                                fontSize={'small'}
                                                sx={{transform: 'scale(0.6)', p: 0, m: 0}}
                                            />
                                            {comment.viewers.map(item => (
                                                <Tooltip
                                                    arrow
                                                    title={
                                                        `${getNameById(item.employee, 'listNameInitials')} ${getHumansDatetime(item.last_date)}`
                                                    }
                                                    key={item.id}
                                                >
                                                    <b>{getNameById(item.employee, 'initials')} |</b>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                    <hr className={'m-0 p-1 w-50'}/>
                                </div>
                            ))
                            :
                            <div>
                                Нет комментариев
                                <hr className={'m-0 p-1 w-50'}/>
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    );
};
