import React, {useEffect, useRef, useState} from "react";

import {Button, Form, InputGroup} from "react-bootstrap";

import {Fab} from "@mui/material";
import {useAppDispatch, useCurrentUser, useSpeechRecognition} from "@shared/hooks";
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import ClearIcon from "@mui/icons-material/Clear";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';

import {Task, taskPageActions} from "@pages/TaskPage";
import {useCreateTaskComment} from "@widgets/TaskForm/model/api";


interface TextResultBlockProps {
    task: Task | undefined;
}

export const CommentInputBlock = (props: TextResultBlockProps) => {
    const {task} = props;
    const {currentUser} = useCurrentUser();
    const {isListening, transcript, startListening} = useSpeechRecognition();
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState<string>("");
    const [cursorPosition, setCursorPosition] = useState<number | null>(0);
    const [createTaskComment, {isLoading}] = useCreateTaskComment();

    const [disabled, setDisabled] = useState<boolean>(true);

    useEffect(() => {
        setDisabled(
            !(
                task?.executor?.id === currentUser.id ||
                task?.created_by?.id === currentUser.id ||
                task?.co_executors?.some(executor => executor.id === currentUser.id)
            )
        );
    }, [currentUser.id, task?.co_executors, task?.created_by?.id, task?.executor?.id, task?.verified_at]);

    useEffect(() => {
        if (transcript && cursorPosition !== null && inputRef.current) {
            const currentText = inputValue || '';

            const beforeCursor = currentText.slice(0, cursorPosition);
            const afterCursor = currentText.slice(cursorPosition);
            const addSpaceBefore = beforeCursor && beforeCursor.slice(-1) !== ' ' ? ' ' : '';
            const addSpaceAfter = afterCursor && afterCursor[0] !== ' ' ? ' ' : '';

            const newText = beforeCursor + addSpaceBefore + transcript + addSpaceAfter + afterCursor;

            setInputValue(newText);
            // Reset cursor position
            setCursorPosition(cursorPosition + transcript.length);
        }
        // eslint-disable-next-line
    }, [transcript]);

    useEffect(() => {
        if (inputRef.current && cursorPosition !== null) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [inputValue, cursorPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart);
        setInputValue(newValue);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        if (e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
            setCursorPosition(e.currentTarget.selectionStart);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
            setCursorPosition(e.currentTarget.selectionStart);
        }
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const input = e.currentTarget as HTMLInputElement;
        if (input.selectionStart === input.selectionEnd) {
            setCursorPosition(input.selectionStart);
        }
    };

    const cleanClb = () => {
        setInputValue('');
    };

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            createCommentClb();
        }
    };

    return (
        <InputGroup>
            <InputGroup.Text className={'ps-5 fs-7 position-relative'}>
                <Fab
                    size="small"
                    color="inherit"
                    aria-label="add"
                    onClick={startListening}
                    disabled={isListening || disabled}
                    className={'position-absolute'}
                    style={{
                        left: '-10px'
                    }}
                >
                    {isListening ?
                        <MicOutlinedIcon fontSize={'small'}/>
                        :
                        <KeyboardVoiceOutlinedIcon fontSize={'small'}/>
                    }
                </Fab>
                Комментарий:

                {!disabled && inputValue &&
                    <button
                        className={'appBtn border-1 border-secondary text-secondary fs-7 position-absolute'}
                        type={'button'}
                        style={{
                            borderRadius: '50%',
                            padding: '.1rem',
                            top: '-6px',
                            right: '-6px',
                            zIndex: '100'
                        }}
                        onClick={cleanClb}
                    >
                        <ClearIcon fontSize={'inherit'} className={'text-secondary fs-7'}/>
                    </button>

                }
            </InputGroup.Text>
            <Form.Control
                as={"input"}
                maxLength={255}
                ref={inputRef}
                readOnly={disabled}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleMouseUp}
                onKeyUp={handleKeyUp}
                onSelect={handleSelect}
            />

            <Button
                variant="outline-dark"
                className={'fs-7'}
                disabled={disabled || isLoading || !inputValue}
                onClick={createCommentClb}
            >
                <b>Добавить</b> <DoneAllIcon fontSize={'small'}/>
            </Button>

        </InputGroup>
    );
};
