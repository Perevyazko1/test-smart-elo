import {useState} from "react";

import TuneIcon from "@mui/icons-material/Tune";


import {ExtendedFilterPanel} from "./ExtendedFilterPanel";
import {AppTooltip} from "@shared/ui";


export const ExtendedFilters = () => {
    const [showExtendedPanel, setShowExtendedPanel] = useState(false);

    return (
        <>
            <AppTooltip title="Дополнительные фильтра">
                <button
                    className={'appBtn blackBtn rounded p-1'}
                    onClick={() => setShowExtendedPanel(!showExtendedPanel)}
                >
                    <TuneIcon fontSize={'small'}/>
                </button>
            </AppTooltip>

            <ExtendedFilterPanel
                show={showExtendedPanel}
                setShow={setShowExtendedPanel}
            />
        </>
    );
};
