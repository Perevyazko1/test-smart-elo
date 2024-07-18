import {getEmployeeName} from "@shared/lib";
import {useMemo} from "react";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";
import {GroupedEmployeeItem} from "@entities/Employee";


interface AppointedByBlockProps {
    value: number | null;
    userList: GroupedEmployeeItem[];
    isLoading: boolean;
}


export const AppointedByBlock = (props: AppointedByBlockProps) => {
    const {value, userList, isLoading} = props;
    
    const getValue = useMemo(() => {
        return userList.find(user => user.user.id === value) || null;
    }, [userList, value])

    return (
        <AppAutocomplete
            variant={'select'}
            value={getValue}
            label={isLoading ? "Загрузка..." : "Задачу назначил"}
            width={250}
            readOnly
            getOptionLabel={(option: GroupedEmployeeItem) => getEmployeeName(option.user, 'listNameInitials')}
        />
    );
};
