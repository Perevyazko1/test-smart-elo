import {CreateTask} from "@widgets/TaskForm/model/types";
import {Form, InputGroup} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";
import {Fab} from "@mui/material";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import {useSpeechRecognition} from "@shared/hooks";
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import ClearIcon from "@mui/icons-material/Clear";

interface TextTitleBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}

export const TextTitleBlock = (props: TextTitleBlockProps) => {
    const {formTask, setFormTask, disabled} = props;
    const {isListening, transcript, startListening} = useSpeechRecognition();
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(formTask.title?.length || 0);

    useEffect(() => {
        if (transcript && cursorPosition !== null && inputRef.current) {
            const currentText = formTask.title;
            const beforeCursor = currentText.slice(0, cursorPosition);
            const afterCursor = currentText.slice(cursorPosition);
            const addSpaceBefore = beforeCursor && beforeCursor.slice(-1) !== ' ' ? ' ' : '';
            const addSpaceAfter = afterCursor && afterCursor[0] !== ' ' ? ' ' : '';

            const newText = beforeCursor + addSpaceBefore + transcript + addSpaceAfter + afterCursor;
            setFormTask({
                ...formTask,
                title: newText,
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
    }, [formTask.title, cursorPosition]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart);
        setFormTask({
            ...formTask,
            title: newValue,
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
            title: '',
        });
    }

    return (
        <InputGroup className="mb-3">
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
                as={"input"}
                maxLength={255}
                ref={inputRef}
                readOnly={disabled}
                value={formTask.title}
                onChange={handleInputChange}
                onClick={handleMouseUp}
                onKeyUp={handleKeyUp}
                onSelect={handleSelect}
            />
        </InputGroup>
    );
};
