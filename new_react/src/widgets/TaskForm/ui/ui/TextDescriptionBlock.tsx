import {CreateTask} from "@widgets/TaskForm/model/types";
import {Form, InputGroup} from "react-bootstrap";
import React, {useEffect} from "react";
import {Fab} from "@mui/material";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import {useSpeechRecognition} from "@shared/hooks";
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';

interface TextDescriptionBlockProps {
    setFormTask: (task: CreateTask) => void;
    formTask: CreateTask;
    disabled: boolean;
}

export const TextDescriptionBlock = (props: TextDescriptionBlockProps) => {
    const {formTask, setFormTask, disabled} = props;
    const {isListening, transcript, startListening} = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setFormTask({
                ...formTask,
                description: transcript,
            })
        }
        //eslint-disable-next-line
    }, [transcript]);

    return (
        <InputGroup className={'mb-3'}>

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
                Описание:
            </InputGroup.Text>
            <Form.Control as="textarea"
                          readOnly={disabled}
                          value={formTask.description}
                          onChange={(e) => setFormTask({
                              ...formTask,
                              description: e.target.value,
                          })}/>
        </InputGroup>
    );
};
