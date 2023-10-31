import React, {memo} from 'react';
import {Button} from "react-bootstrap";
import {ButtonProps} from "react-bootstrap/Button";

export const UpdatePageBtn = memo((props: ButtonProps) => {
    return (
        <Button
            onClick={() => window.location.reload()}
            variant={'dark'}
            className={'bg-body-tertiary px-3'}
            {...props}
        >
            <i className="text-white fas fa-sync-alt fs-6"/>
        </Button>
    );
});