import React, {useCallback} from "react";

import {EqNumberListTipe} from "../../model/lib/createEqNumberLists";
import {EqNumberBtn} from "@widgets/EqCard/ui/ui/EqNumberBtn";
import {EqAssignment} from "@widgets/EqCardList/model/types";
import {getEmployeeName} from "@shared/lib";
import {useEmployeeList} from "@widgets/TaskForm/model/api";
import {useCurrentUser} from "@shared/hooks";

interface EqNumbersProps {
    assignmentsLists: EqNumberListTipe,
    setNumber: (item: EqAssignment) => void;
}

export const EqNumbers = (props: EqNumbersProps) => {
    const {assignmentsLists, setNumber} = props;
    const {currentUser} = useCurrentUser();

    const {data: userList} = useEmployeeList({
        departments: [currentUser.current_department?.id],
    });

    const getUserInitials = useCallback((assignment: EqAssignment): string => {
        if (!userList) {
            return ""
        }
        return getEmployeeName(userList.find(item => item.id === assignment.executor), 'initials')
    }, [userList]);


    return (
        <>
            {assignmentsLists.primary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    getUserInitials={getUserInitials}
                    onClick={() => setNumber(item)}
                    colorCls={'blueBtn'}
                />
            ))}

            {assignmentsLists.selectedLocked.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    getUserInitials={getUserInitials}
                    onClick={() => setNumber(item)}
                    colorCls={'blackBtn'}
                />
            ))}

            {assignmentsLists.secondary.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    getUserInitials={getUserInitials}
                    onClick={() => setNumber(item)}
                    colorCls={'greyBtn'}
                />
            ))}

            {assignmentsLists.lockedNums.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    getUserInitials={getUserInitials}
                    onClick={() => setNumber(item)}
                    colorCls={''}
                />
            ))}

            {assignmentsLists.confirmed.map((item) => (
                <EqNumberBtn
                    key={item.id}
                    item={item}
                    getUserInitials={getUserInitials}
                    colorCls={'greenBtn'}
                />
            ))}
        </>
    );
};
