import {AppNavbar} from "@widgets/AppNavbar";
import {useQueryParams} from "@shared/hooks";

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


    const seriesSizeClb = (item: string) => {
        setQueryParam('series_size', item)
    }


    return (
        <AppNavbar showNav={showCanvas} closeClb={closeClb}>
            <EqDepWidget/>

            <EqFilters/>

            <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>

        </AppNavbar>
    );
};
