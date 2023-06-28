import {StateSchema} from "app/providers/StoreProvider";
import {initialState} from "../../slice/eqFiltersSlice";

export const getEqProjectFilter = (state: StateSchema) => {
    return {
        pin_code: state.employee.authData?.pin_code,
        department_number: state.employee.authData?.current_department?.number,
        view_mode_key: state.eqFilters?.viewModeFilter.currentFilter.key || initialState.viewModeFilter.currentFilter.key,
        project_filter: state.eqFilters?.projectFilter.currentFilter || initialState.projectFilter.currentFilter,
        week: state.eqFilters?.weekData.week,
        year: state.eqFilters?.weekData.year,
    }
}
