import React, {useState} from "react";

import {Task} from "@entities/Task";
import {taskPageActions} from "@pages/TaskPage";
import {useAppDispatch, useCurrentUser, useEmployeeName} from "@shared/hooks";
import {AppSkeleton, AppVoiceInput} from "@shared/ui";
import {getHumansDatetime} from "@shared/lib";

import {useCreateTaskComment, useTaskCommentList} from "../../model/api";


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

            <div className={'fs-7 p-1 ps-3 w-100'}>
                {(commentsIsLoading || isLoading) &&
                    <AppSkeleton className={'m-1 w-100'} style={{height: '20px'}}/>
                }

                {comments &&
                    <>
                        {comments.length > 0 ?
                            comments.map(comment => (
                                <div key={comment.id} className={'fs-7'}>
                                    {getHumansDatetime(comment.add_date)} | {getNameById(comment.author, 'listNameInitials')} -
                                    <b className={'ms-3'}>{comment.comment}</b>
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
