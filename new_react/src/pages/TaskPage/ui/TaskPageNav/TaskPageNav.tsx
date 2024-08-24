import {AppNavbar} from "@widgets/AppNavbar";

import {ViewModeNav} from "./ui/ViewModeNav";
import {SortModeNav} from "./ui/SortModeNav";
import {ExecutorFilter} from "./ui/ExecutorFilter";
import {DepartmentFilter} from "./ui/DepartmentFilter";


interface TaskPageNavProps {
    showNav?: boolean;
    closeClb?: () => void;
}


export const TaskPageNav = (props: TaskPageNavProps) => {

    return (
        <AppNavbar showNav={props.showNav} closeClb={props.closeClb}>
            <SortModeNav/>
            <ViewModeNav/>
            <DepartmentFilter/>
            <ExecutorFilter/>
        </AppNavbar>
    );
};
