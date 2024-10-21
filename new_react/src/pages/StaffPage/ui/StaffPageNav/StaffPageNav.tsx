import {useState} from "react";

import {AppNavbar} from "@widgets/AppNavbar";

import {StaffSelectDepartment} from "./ui/StaffSelectDepartment";
import {StaffIsActiveFilter} from "./ui/StaffIsActiveFilter";
import {StaffWagesTypeFilter} from "./ui/StaffWagesTypeFilter";
import {StaffWagesOnlyFilter} from "./ui/StaffWagesOnlyFilter";
import {StaffClearFilters} from "./ui/StaffClearFilters";
import {StaffWagesByTargetDateFilter} from "./ui/StaffWagesByTargetDateFilter";
import {StaffAddNewUser} from "./ui/StaffAddNewUser";


export const StaffPageNav = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
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
