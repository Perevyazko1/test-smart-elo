import React, { useEffect, useRef, useState } from "react";

import { Form, InputGroup } from "react-bootstrap";
import { Fab } from "@mui/material";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import ClearIcon from "@mui/icons-material/Clear";
import { useSpeechRecognition } from "@shared/hooks";

import { CreateTask } from "../../model/types";

interface TextDescriptionBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}

export const TextDescriptionBlock = (props: TextDescriptionBlockProps) => {
    const { formTask, setFormTask, disabled } = props;
    const { isListening, transcript, startListening } = useSpeechRecognition();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(formTask.description?.length || 0);

    useEffect(() => {
        if (transcript && cursorPosition !== null && inputRef.current) {
            const currentText = formTask.description || '';

            const beforeCursor = currentText.slice(0, cursorPosition);
            const afterCursor = currentText.slice(cursorPosition);
            const addSpaceBefore = beforeCursor && beforeCursor.slice(-1) !== ' ' ? ' ' : '';
            const addSpaceAfter = afterCursor && afterCursor[0] !== ' ' ? ' ' : '';

            const newText = beforeCursor + addSpaceBefore + transcript + addSpaceAfter + afterCursor;

            setFormTask({
                ...formTask,
                description: newText,
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
    }, [formTask.description, cursorPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart);
        setFormTask({
            ...formTask,
            description: newValue,
        });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
            setCursorPosition(e.currentTarget.selectionStart);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
            setCursorPosition(e.currentTarget.selectionStart);
        }
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const input = e.currentTarget as HTMLTextAreaElement;
        if (input.selectionStart === input.selectionEnd) {
            setCursorPosition(input.selectionStart);
        }
    };

    const cleanClb = () => {
        setFormTask({
            ...formTask,
            description: '',
        });
    };

    return (
        <InputGroup className={'mb-2'}>
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
                        <MicOutlinedIcon fontSize={'small'} />
                        :
                        <KeyboardVoiceOutlinedIcon fontSize={'small'} />
                    }
                </Fab>
                Описание:
                {!disabled && formTask.description &&
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
                        <ClearIcon fontSize={'inherit'} className={'text-secondary fs-7'} />
                    </button>
                }
            </InputGroup.Text>
            <Form.Control
                as="textarea"
                ref={inputRef}
                readOnly={disabled}
                maxLength={5000}
                value={formTask.description}
                onChange={handleInputChange}
                onMouseUp={handleMouseUp}
                onKeyUp={handleKeyUp}
                onSelect={handleSelect}
            />
        </InputGroup>
    );
};
