import React from "react";
import {Button} from "@mui/material";
import {useAppModal} from "@shared/hooks";

export const ModalComponent = () => {
    const {handleOpen} = useAppModal();


    return (
        <>
            <Button onClick={() => handleOpen(<ModalComponent/>)}>
                Открыть модалку
            </Button>
        </>
    );
};
