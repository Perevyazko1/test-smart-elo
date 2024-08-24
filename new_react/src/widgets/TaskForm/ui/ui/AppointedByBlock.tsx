import {getEmployeeName} from "@shared/lib";
import {useMemo} from "react";
import {GroupedEmployeeItem} from "@entities/Employee";
import {AppSelect} from "@shared/ui";


interface AppointedByBlockProps {
    value: number | null;
    userList: GroupedEmployeeItem[];
    isLoading: boolean;
}


export const AppointedByBlock = (props: AppointedByBlockProps) => {
    const {value, userList, isLoading} = props;
    
    const getValue = useMemo(() => {
        return userList.find(user => user.user.id === value) || null;
    }, [userList, value]);

    return (
        <AppSelect
            variant={'select'}
            colorScheme={'lightInput'}
            bordered
            className={'flex-fill'}
            label={"Задачу назначил"}
            style={{minWidth: '250px'}}
            value={getValue}
            readOnly
            isLoading={isLoading}
            getOptionLabel={(option: GroupedEmployeeItem) => getEmployeeName(option.user, 'listNameInitials')}
        />
    );
};
