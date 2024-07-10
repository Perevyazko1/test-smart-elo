import {AppNavbar} from "@widgets/AppNavbar";
import {useCurrentUser, usePermission, useQueryParams} from "@shared/hooks";

import {EqSeriesSize} from "./EqSeriesSize";
import {EqDepWidget} from "./EqDepWidget";
import {EqFilters} from "@pages/EqPage/ui/EqNav/EqFilters";
import {APP_PERM} from "@shared/consts";

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
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const seriesSizeClb = (item: string) => {
        setQueryParam('series_size', item)
    }


    return (
        <AppNavbar showNav={showCanvas} closeClb={closeClb}>
            <EqDepWidget/>

            <EqFilters/>

            {!currentUser.current_department?.single && !isViewer &&
                <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>
            }

        </AppNavbar>
    );
};
