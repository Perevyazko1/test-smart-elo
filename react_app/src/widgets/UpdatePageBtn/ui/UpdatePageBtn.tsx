import React, {memo} from 'react';
import {Button} from "react-bootstrap";
import {ButtonProps} from "react-bootstrap/Button";

export const UpdatePageBtn = memo((props: ButtonProps) => {
    return (
        <Button
            onClick={() => window.location.reload()}
            {...props}
        >
            <i className="fas fa-sync-alt fs-5 d-xl-flex align-items-xl-center py-xl-0 mx-xl-0 me-xl-0"/>
        </Button>
    );
});