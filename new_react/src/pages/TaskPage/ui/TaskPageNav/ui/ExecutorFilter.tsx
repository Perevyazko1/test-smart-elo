import React, {useEffect, useState} from "react";

import {GroupedEmployeeItem, useSortedUserList} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import {useQueryParams} from "@shared/hooks";
import {AppSelect, UserOptionRender} from "@shared/ui";

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

    return (
        <AppSelect
            style={{width: 160}}
            isLoading={usersIsLoading}
            colorScheme={'darkInput'}
            variant={'multiple'}
            label={'Исполнитель'}
            value={selectedUsers}
            options={sortedUserList}
            onSelect={selectUserFilterClb}
            getOptionLabel={option => getEmployeeName(option.user, 'listNameInitials')}
            getRenderOption={(props) => <UserOptionRender {...props}/>}
        />
    );
};
