import {AppNavbar} from "@widgets/AppNavbar";
import {useCurrentUser, useQueryParams} from "@shared/hooks";

import {EqSeriesSize} from "./EqSeriesSize";
import {EqDepWidget} from "./EqDepWidget";
import {EqFilters} from "@pages/EqPage/ui/EqNav/EqFilters";

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


    const seriesSizeClb = (item: string) => {
        setQueryParam('series_size', item)
    }


    return (
        <AppNavbar showNav={showCanvas} closeClb={closeClb}>
            <EqDepWidget/>

            <EqFilters/>

            {!currentUser.current_department.single &&
                <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>
            }

        </AppNavbar>
    );
};
