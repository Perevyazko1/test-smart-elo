import {AppNavbar} from "@widgets/AppNavbar";

import {StaffSelectDepartment} from "./ui/StaffSelectDepartment";
import {StaffIsActiveFilter} from "./ui/StaffIsActiveFilter";
import {StaffWagesTypeFilter} from "./ui/StaffWagesTypeFilter";
import {StaffWagesOnlyFilter} from "./ui/StaffWagesOnlyFilter";
import {StaffClearFilters} from "./ui/StaffClearFilters";
import {StaffWagesByTargetDateFilter} from "./ui/StaffWagesByTargetDateFilter";
import {StaffAddNewUser} from "./ui/StaffAddNewUser";


export const StaffPageNav = () => {
    return (
        <AppNavbar>
            <StaffSelectDepartment/>
            <StaffWagesTypeFilter/>
            <StaffIsActiveFilter/>
            <StaffWagesOnlyFilter/>
            <StaffWagesByTargetDateFilter/>
            <StaffAddNewUser/>

            <StaffClearFilters/>
        </AppNavbar>
    );
};
