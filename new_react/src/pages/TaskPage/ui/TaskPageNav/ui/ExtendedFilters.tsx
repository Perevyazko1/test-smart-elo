import {useState} from "react";

import TuneIcon from "@mui/icons-material/Tune";


import {ExtendedFilterPanel} from "./ExtendedFilterPanel";


export const ExtendedFilters = () => {
    const [showExtendedPanel, setShowExtendedPanel] = useState(false);

    return (
        <>
            <button
                className={'appBtn blackBtn rounded p-1'}
                onClick={() => setShowExtendedPanel(!showExtendedPanel)}
            >
                <TuneIcon fontSize={'small'}/>
            </button>

            <ExtendedFilterPanel
                show={showExtendedPanel}
                setShow={setShowExtendedPanel}
            />
        </>
    );
};
