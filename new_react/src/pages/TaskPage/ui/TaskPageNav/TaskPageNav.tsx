import {AppNavbar} from "@widgets/AppNavbar";

import {ViewModeNav} from "./ui/ViewModeNav";
import {SortModeNav} from "./ui/SortModeNav";
import {ExecutorFilter} from "./ui/ExecutorFilter";
import {DepartmentFilter} from "./ui/DepartmentFilter";
import {ExtendedFilters} from "@pages/TaskPage/ui/TaskPageNav/ui/ExtendedFilters";
import {AppTooltip} from "@shared/ui";


export const TaskPageNav = () => {
    return (
        <AppNavbar>
            <AppTooltip title="Переключение режимов сотрировки">
                <SortModeNav/>
            </AppTooltip>

            <AppTooltip title="Переключение шаблонов режимов отображения задач">
                <ViewModeNav/>
            </AppTooltip>

            <AppTooltip title="Фильтр по полю Отделы">
                <DepartmentFilter/>
            </AppTooltip>


            <ExecutorFilter/>

            <ExtendedFilters/>
        </AppNavbar>
    );
};
