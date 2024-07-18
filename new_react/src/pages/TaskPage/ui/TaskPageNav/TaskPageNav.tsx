import {AppNavbar} from "@widgets/AppNavbar";

import {ViewModeNav} from "./ui/ViewModeNav";
import {SortModeNav} from "./ui/SortModeNav";
import {ExecutorFilter} from "./ui/ExecutorFilter";
import {DepartmentFilter} from "./ui/DepartmentFilter";


export const TaskPageNav = () => {

    return (
        <AppNavbar>
            <SortModeNav/>
            <ViewModeNav/>
            <ExecutorFilter/>
            <DepartmentFilter/>
        </AppNavbar>
    );
};
