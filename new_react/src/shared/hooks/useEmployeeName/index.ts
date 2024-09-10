import {useCallback, useContext} from "react";
import {UserListContext} from "@app";
import {getEmployeeName, EmployeeNameVariants} from "@shared/lib";

export const useEmployeeName = () => {
    const userListContext = useContext(UserListContext);

    const getNameById = useCallback((id: number | null | undefined, variant: EmployeeNameVariants) => {
        return getEmployeeName(userListContext?.usersList?.find(user => user.id === id), variant);
    }, [userListContext]);

    return {getNameById, isLoading: userListContext ? userListContext.isLoading : true};
}