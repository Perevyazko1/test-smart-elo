import {AppNavbar} from "@widgets/AppNavbar";

import {ViewModeNav} from "./ui/ViewModeNav";
import {SortModeNav} from "./ui/SortModeNav";


export const TaskPageNav = () => {

    return (
        <AppNavbar>
            <SortModeNav/>
            <ViewModeNav/>
        </AppNavbar>
    );
};
