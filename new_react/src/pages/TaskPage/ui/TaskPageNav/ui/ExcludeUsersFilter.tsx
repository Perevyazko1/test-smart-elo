import React, {useEffect, useState} from "react";

import {GroupedEmployeeItem, useSortedUserList} from "@entities/Employee";
import {useQueryParams} from "@shared/hooks";
import {AppSelect, UserOptionRender} from "@shared/ui";
import {getEmployeeName} from "@shared/lib";


export const ExcludeUsersFilter = () => {
    const {sortedUserList, usersIsLoading} = useSortedUserList();
    const {queryParameters, setQueryParam} = useQueryParams();

    const [excludedUsers, setExcludedUsers] = useState<GroupedEmployeeItem[]>([]);

    const selectUserFilterClb = (users: GroupedEmployeeItem[] | null) => {
        const queryValue = users?.map(user => user.user.id).join();
        setQueryParam('exclude_users', queryValue || '');
    };

    useEffect(() => {
        if (sortedUserList) {
            if (queryParameters.exclude_users) {
                const queryIds = queryParameters.exclude_users.split(',').map(item => Number(item));
                setExcludedUsers(sortedUserList.filter(item => queryIds.includes(item.user.id)));
            } else {
                setExcludedUsers([]);
            }
        }
    }, [queryParameters.exclude_users, sortedUserList]);

    return (
        <AppSelect
            style={{width: 240}}
            isLoading={usersIsLoading}
            colorScheme={'darkInput'}
            variant={'multiple'}
            label={'Исключить пользователя'}
            value={excludedUsers}
            options={sortedUserList}
            onSelect={selectUserFilterClb}
            getOptionLabel={option => getEmployeeName(option.user, 'listNameInitials')}
            getRenderOption={(props) => <UserOptionRender {...props}/>}
        />
    );
};
