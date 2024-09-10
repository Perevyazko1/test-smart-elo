import {useMemo} from "react";

import {useCurrentUser} from "@shared/hooks";

import {GroupedEmployeeItem} from "../types/employee";
import { useEmployeeList } from "../api";


export const useSortedUserList = () => {
    const {data: userList, isLoading: usersIsLoading} = useEmployeeList({});
    const {currentUser} = useCurrentUser();

    const sortedUserList = useMemo(() => {
        const groupedList: GroupedEmployeeItem[] = [];

        userList?.forEach(user => {
            if (currentUser.favorite_users.includes(user.id)) {
                groupedList.push({
                    group: 'Избранные',
                    user: user
                })
            } else if (user.boss === currentUser.id) {
                groupedList.push({
                    group: 'Прямые подчиненные',
                    user: user
                })
            } else {
                groupedList.push({
                    group: user.permanent_department?.name || 'Без отдела',
                    user: user
                })
            }
        })

        return groupedList.sort((a, b) => {
            if (a.group === 'Избранные' && b.group !== 'Избранные') {
                return -1; // 'Избранные' должны идти первыми
            } else if (a.group !== 'Избранные' && b.group === 'Избранные') {
                return 1; // 'Избранные' должны идти первыми
            } else if (a.group === 'Прямые подчиненные' && b.group !== 'Прямые подчиненные') {
                return -1; // 'Подчиненные' должны идти вторыми
            } else if (a.group !== 'Прямые подчиненные' && b.group === 'Прямые подчиненные') {
                return 1; // 'Подчиненные' должны идти вторыми
            } else {
                return a.group.localeCompare(b.group); // Сортировка по имени отдела
            }
        });
    }, [currentUser.favorite_users, currentUser.id, userList]);

    return {sortedUserList, usersIsLoading}
}