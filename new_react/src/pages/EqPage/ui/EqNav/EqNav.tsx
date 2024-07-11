import {AppNavbar} from "@widgets/AppNavbar";
import {useAppDispatch, useCurrentUser, usePermission, useQueryParams} from "@shared/hooks";

import {EqSeriesSize} from "./EqSeriesSize";
import {EqDepWidget} from "./EqDepWidget";
import {EqFilters} from "@pages/EqPage/ui/EqNav/EqFilters";
import {APP_PERM} from "@shared/consts";
import {AppSwitch} from "@shared/ui";
import {eqPageActions} from "@pages/EqPage";

interface EqNavProps {
    showCanvas: boolean;
    closeClb: () => void;
}


export const EqNav = (props: EqNavProps) => {
    const {
        showCanvas,
        closeClb
    } = props;

    const {queryParameters, setQueryParam} = useQueryParams();
    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
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
        dispatch(eqPageActions.awaitUpdated())
    }


    return (
        <AppNavbar showNav={showCanvas} closeClb={closeClb}>
            <EqDepWidget/>

            <EqFilters/>

            {!currentUser.current_department?.single && !isViewer &&
                <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>
            }

            <AppSwitch
                idSwitch={'eq-nav-assembled-switch'}
                checked={!!queryParameters.assembled}
                onSwitch={showAssembledOnly}
                label={queryParameters.assembled ? "Все" : "Дост."}
            />

        </AppNavbar>
    );
};
