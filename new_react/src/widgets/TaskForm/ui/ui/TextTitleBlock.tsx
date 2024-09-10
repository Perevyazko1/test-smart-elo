import React, {useEffect, useId, useRef, useState} from "react";
import {Form, InputGroup} from "react-bootstrap";
import {Fab} from "@mui/material";

import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';

import {Task, UpdateTask} from "@entities/Task";
import {useSpeechRecognition} from "@shared/hooks";


interface TextTitleBlockProps {
    task?: Task;
    setFormDataClb: <K extends keyof UpdateTask>(key: K, value: UpdateTask[K]) => void;
    formTask: UpdateTask;
    disabled: boolean;
}

export const TextTitleBlock = (props: TextTitleBlockProps) => {
    const {formTask, setFormDataClb, disabled, task} = props;
    const id = useId();
    const {isListening, transcript, startListening} = useSpeechRecognition();
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(formTask.title?.length || 0);

    useEffect(() => {
        if (transcript && cursorPosition !== null && inputRef.current) {
            const currentText = formTask.title || '';

            const beforeCursor = currentText.slice(0, cursorPosition);
            const afterCursor = currentText.slice(cursorPosition);
            const addSpaceBefore = beforeCursor && beforeCursor.slice(-1) !== ' ' ? ' ' : '';
            const addSpaceAfter = afterCursor && afterCursor[0] !== ' ' ? ' ' : '';

            const newText = beforeCursor + addSpaceBefore + transcript + addSpaceAfter + afterCursor;
            setFormDataClb('title', newText);
            // Reset cursor position
            setCursorPosition(cursorPosition + transcript.length);
        }
        // eslint-disable-next-line
    }, [transcript]);

    useEffect(() => {
        if (inputRef.current && cursorPosition !== null) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [formTask.title, cursorPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart);
        setFormDataClb('title', newValue);

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
        setFormDataClb('description', null);
    };

    return (
        <InputGroup>
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
                Название<b className={'text-danger fs-7'}>*</b>:

                {!disabled && formTask.title &&
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
                required
                id={id}
                as={"input"}
                maxLength={255}
                ref={inputRef}
                readOnly={disabled}
                value={formTask.title || task?.title || ""}
                onChange={handleInputChange}
                onClick={handleMouseUp}
                onKeyUp={handleKeyUp}
                onSelect={handleSelect}
            />
        </InputGroup>
    );
};
