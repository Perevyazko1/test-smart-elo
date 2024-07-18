import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {GroupedEmployeeItem, useSortedUserList} from "@entities/Employee";
import {UserListRender} from "@widgets/UserListRender/UserListRender";
import {getEmployeeName} from "@shared/lib";
import React, {useEffect, useMemo, useState} from "react";
import {useQueryParams} from "@shared/hooks";

export const ExecutorFilter = () => {
    const {sortedUserList, usersIsLoading} = useSortedUserList();
    const {queryParameters, setQueryParam} = useQueryParams();

    const [selectedUsers, setSelectedUsers] = useState<GroupedEmployeeItem[]>([]);

    const selectUserFilterClb = (users: GroupedEmployeeItem[] | null) => {
        const queryValue = users?.map(user => user.user.id).join();
        setQueryParam('users', queryValue || '');
    };

    useEffect(() => {
        if (sortedUserList) {
            if (queryParameters.users) {
                const queryIds = queryParameters.users.split(',').map(item => Number(item));
                setSelectedUsers(sortedUserList.filter(item => queryIds.includes(item.user.id)));
            } else {
                setSelectedUsers([]);
            }
        }
    }, [queryParameters.users, sortedUserList]);

    const getLabel = useMemo(() => {
        if (usersIsLoading) {
            return 'Загрузка...';
        } else if (selectedUsers.length === 0) {
            return  'Исполнители (все)';
        } else {
            return 'Исполнители';
        }
    }, [usersIsLoading, selectedUsers.length]);


    return (
        <AppAutocomplete
            colorscheme={'dark'}
            style={{zIndex: "1000", marginTop: "3px"}}
            label={getLabel}
            variant={'multiple'}
            value={selectedUsers}
            groupBy={(option: GroupedEmployeeItem) => option.group}
            onChangeClb={selectUserFilterClb}
            renderOption={(props, option) => option ?
                <UserListRender
                    props={props}
                    option={option.user}
                    key={option.user.id}
                /> : undefined}
            getOptionLabel={option => getEmployeeName(option.user, 'listNameInitials')}
            options={sortedUserList}
            loading={usersIsLoading}
            width={250}
        />
    );
};
