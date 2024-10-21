import {useState, ReactElement} from "react";

import {Tooltip} from "@mui/material";


interface AppTooltipProps {
    title: string;
    children: ReactElement<any, any>;
    classNames?: string;
}

export const AppTooltip = (props: AppTooltipProps) => {
    const {title, children, classNames} = props;

    const [show, setShow] = useState(false);

    return (
        <Tooltip
            disableTouchListener
            describeChild
            arrow
            open={show}
            title={title}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={() => setShow(false)}
            PopperProps={{sx: {
                maxWidth: 150
            }}}
        >
            <span className={classNames || 'd-flex'}>
                {children}
            </span>
        </Tooltip>
    );
};
