import {StateSchema} from "app/providers/StoreProvider";
import {initialState} from "../../slice/eqFiltersSlice";


export interface EqFilters {
    pin_code: number | undefined;
    department_number: number | undefined;
    view_mode_key: number | string;
    project_filter: string;
    week: number | undefined;
    year: number | undefined;
}

export const getEqProjectFilter = (state: StateSchema): EqFilters => {
    return {
        pin_code: state.employee.authData?.pin_code,
        department_number: state.employee.authData?.current_department?.number,
        view_mode_key: state.eqFilters?.viewModeFilter.currentFilter.key || initialState.viewModeFilter.currentFilter.key,
        project_filter: state.eqFilters?.projectFilter.currentFilter || initialState.projectFilter.currentFilter,
        week: state.eqFilters?.weekData.week,
        year: state.eqFilters?.weekData.year,
    }
}
