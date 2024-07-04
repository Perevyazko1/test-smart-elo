import {CreateTask} from "@widgets/TaskForm/model/types";
import {Form, InputGroup} from "react-bootstrap";
import React, {useEffect} from "react";
import {Fab} from "@mui/material";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import {useSpeechRecognition} from "@shared/hooks";
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';

interface TextTitleBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}

export const TextTitleBlock = (props: TextTitleBlockProps) => {
    const {formTask, setFormTask, disabled} = props;
    const {isListening, transcript, startListening} = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setFormTask({
                ...formTask,
                title: transcript,
            })
        }
        //eslint-disable-next-line
    }, [transcript]);

    return (
        <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1" className={'ps-5 fs-7'}>
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
            </InputGroup.Text>
            <Form.Control
                required
                readOnly={disabled}
                value={formTask.title}
                onChange={(e) => setFormTask({
                    ...formTask,
                    title: e.target.value,
                })}
            />
        </InputGroup>

    );
};
