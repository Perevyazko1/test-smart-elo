import {AppNavbar} from "@widgets/AppNavbar";

import {ViewModeNav} from "./ui/ViewModeNav";
import {SortModeNav} from "./ui/SortModeNav";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import React, {useEffect, useState} from "react";
import {useEmployeeList} from "@widgets/TaskForm/model/api";
import {getEmployeeName} from "@shared/lib";
import {Employee} from "@entities/Employee";
import {useQueryParams} from "@shared/hooks";


export const TaskPageNav = () => {
    const {data: userList, isLoading: usersIsLoading} = useEmployeeList({});
    const {setQueryParam} = useQueryParams();

    const [selectedUsers, setSelectedUsers] = useState<Employee[]>([]);

    useEffect(() => {
        const queryValue = selectedUsers.map(user => user.id).join()
        setQueryParam('users', queryValue)
        //eslint-disable-next-line
    }, [selectedUsers]);

    const selectUserFilterClb = (users: Employee[] | null) => {
        setSelectedUsers(users || [])
    };

    return (
        <AppNavbar>
            <SortModeNav/>
            <ViewModeNav/>
            <AppAutocomplete
                colorScheme={'dark'}
                style={{zIndex: "1000", marginTop: "3px"}}
                label={selectedUsers.length === 0 ? 'Исполнители (все)' : 'Исполнители'}
                variant={'multiple'}
                value={selectedUsers}
                onChangeClb={selectUserFilterClb}
                getOptionLabel={option => getEmployeeName(option, 'listNameInitials')}
                options={userList}
                loading={usersIsLoading}
                width={300}

            />
        </AppNavbar>
    );
};
