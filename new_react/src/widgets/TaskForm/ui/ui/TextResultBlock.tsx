import {CreateTask} from "@widgets/TaskForm/model/types";
import {Form, InputGroup} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";
import {Fab} from "@mui/material";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import {useCurrentUser, useSpeechRecognition} from "@shared/hooks";
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import ClearIcon from "@mui/icons-material/Clear";
import {Task} from "@pages/TaskPage";

interface TextResultBlockProps {
    task: Task | undefined;
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
}

export const TextResultBlock = (props: TextResultBlockProps) => {
    const {formTask, setFormTask, task} = props;
    const {currentUser} = useCurrentUser();
    const {isListening, transcript, startListening} = useSpeechRecognition();
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(formTask.execution_comment?.length || 0);


    const [disabled, setDisabled] = useState<boolean>(true);

    useEffect(() => {
        setDisabled(!(formTask.executor === currentUser.id || formTask.co_executors.includes(currentUser.id)));
    }, [currentUser.id, formTask.co_executors, formTask.executor]);

    useEffect(() => {
        if (disabled) {
            setFormTask({
                ...formTask,
                execution_comment: task?.execution_comment || ''
            })
        }
        // eslint-disable-next-line
    }, [disabled]);

    useEffect(() => {
        if (transcript && cursorPosition !== null && inputRef.current) {
            const currentText = formTask.execution_comment || '';
            const beforeCursor = currentText.slice(0, cursorPosition);
            const afterCursor = currentText.slice(cursorPosition);
            const addSpaceBefore = beforeCursor && beforeCursor.slice(-1) !== ' ' ? ' ' : '';
            const addSpaceAfter = afterCursor && afterCursor[0] !== ' ' ? ' ' : '';

            const newText = beforeCursor + addSpaceBefore + transcript + addSpaceAfter + afterCursor;
            setFormTask({
                ...formTask,
                execution_comment: newText,
            });
            // Reset cursor position
            setCursorPosition(cursorPosition + transcript.length);
        }
        // eslint-disable-next-line
    }, [transcript]);

    useEffect(() => {
        if (inputRef.current && cursorPosition !== null) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [formTask.execution_comment, cursorPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart);
        setFormTask({
            ...formTask,
            execution_comment: newValue,
        });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setCursorPosition(e.currentTarget.selectionStart);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCursorPosition(e.currentTarget.selectionStart);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const input = e.currentTarget as HTMLInputElement;
        setCursorPosition(input.selectionStart);
    };

    const cleanClb = () => {
        setFormTask({
            ...formTask,
            execution_comment: '',
        });
        setCursorPosition(0);
    }

    return (
        <InputGroup className="mb-2">
            <InputGroup.Text id="basic-addon1" className={'ps-5 fs-7 position-relative'}>
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
                Результат:

                {!disabled && formTask.execution_comment &&
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
                value={formTask.execution_comment}
                onChange={handleInputChange}
                onClick={handleMouseUp}
                onKeyUp={handleKeyUp}
                onSelect={handleSelect}
            />
        </InputGroup>
    );
};
