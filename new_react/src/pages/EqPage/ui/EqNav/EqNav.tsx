import {AppNavbar} from "@widgets/AppNavbar";
import {useCurrentUser, usePermission, useQueryParams} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {AppSwitch} from "@shared/ui";

import {EqSeriesSize} from "./EqSeriesSize";
import {EqDepWidget} from "./EqDepWidget";
import {EqFilters} from "./EqFilters";

interface EqNavProps {
    showCanvas: boolean;
    closeClb: () => void;
}


export const EqNav = (props: EqNavProps) => {
    const {
        showCanvas,
        closeClb,
    } = props;

    const {queryParameters, setQueryParam} = useQueryParams();
    const {currentUser} = useCurrentUser();
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const seriesSizeClb = (item: string) => {
        setQueryParam('series_size', item)
    }

    const showAssembledOnly = () => {
        if (queryParameters.assembled) {
            setQueryParam('assembled', '')
        } else {
            setQueryParam('assembled', 'all')
        }
    }

    return (
        <AppNavbar showNav={showCanvas} closeClb={closeClb}>
            <EqDepWidget/>

            <EqFilters/>

            {!currentUser.current_department?.single && !isViewer &&
                <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>
            }

            <div style={{transform: "scale(0.8)"}}>
                <AppSwitch
                    idSwitch={'eq-nav-assembled-switch'}
                    checked={!!queryParameters.assembled}
                    onSwitch={showAssembledOnly}
                    label={queryParameters.assembled ? "Все" : "Дост."}
                />
            </div>

        </AppNavbar>
    );
};
