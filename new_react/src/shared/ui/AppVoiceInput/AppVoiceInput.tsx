import React, {useEffect, useId, useMemo, useRef, useState} from "react";

import {Button, Form, InputGroup} from "react-bootstrap";

import {Fab} from "@mui/material";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import KeyboardVoiceOutlinedIcon from "@mui/icons-material/KeyboardVoiceOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ClearIcon from "@mui/icons-material/Clear";

import {useSpeechRecognition} from "@shared/hooks";

interface AppVoiceInputProps {
    label: string;
    required?: boolean;
    value: string;
    setValue: (value: string) => void;
    asTextarea?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    onSubmit?: () => void;
}

export const AppVoiceInput = (props: AppVoiceInputProps) => {
    const {
        label,
        value,
        setValue,
        onSubmit,
        required = false,
        asTextarea = false,
        isLoading = false,
        disabled = false,
    } = props;

    const id = useId();

    const inputId = useMemo(() => {
        const date: string = new Date().toISOString();
        return id + date;
    }, [id]);

    const [cursorPosition, setCursorPosition] = useState<number | null>(value.length);


    const {isListening, transcript, startListening} = useSpeechRecognition();

    const inputRef = useRef<HTMLInputElement>(null);

    const cleanClb = () => {
        setValue("");
    };

    useEffect(() => {
        if (transcript && cursorPosition !== null && inputRef.current) {
            const currentText = value;

            const beforeCursor = currentText.slice(0, cursorPosition);
            const afterCursor = currentText.slice(cursorPosition);
            const addSpaceBefore = beforeCursor && beforeCursor.slice(-1) !== ' ' ? ' ' : '';
            const addSpaceAfter = afterCursor && afterCursor[0] !== ' ' ? ' ' : '';

            const newText = beforeCursor + addSpaceBefore + transcript + addSpaceAfter + afterCursor;
            setValue(newText);
            // Reset cursor position
            setCursorPosition(cursorPosition + transcript.length);
        }
        // eslint-disable-next-line
    }, [transcript]);

    useEffect(() => {
        if (inputRef.current && cursorPosition !== null) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [value, cursorPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart);
        setValue(newValue);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSubmit) {
            e.preventDefault();
            onSubmit();
        }
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
                {label}

                {required ? <b className={'text-danger fs-7'}>*</b> : null}
                :

                {!disabled && value &&
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
                id={inputId}
                as={asTextarea ? "textarea" : "input"}
                required={required}
                maxLength={asTextarea ? 5000 : 255}
                ref={inputRef}
                readOnly={disabled}
                value={value}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                onClick={handleMouseUp}
                onKeyUp={handleKeyUp}
                onSelect={handleSelect}
            />

            {onSubmit ?
                <Button
                    variant="outline-dark"
                    className={'fs-7'}
                    disabled={isLoading || !value}
                    onClick={onSubmit}
                >
                    <b>Добавить</b> <DoneAllIcon fontSize={'small'}/>
                </Button>
                :
                null
            }

        </InputGroup>
    );
};
