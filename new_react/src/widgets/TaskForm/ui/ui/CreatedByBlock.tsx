import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import {AppSelect} from "@shared/ui";


interface AppointedByBlockProps {
    value: Employee;
}


export const CreatedByBlock = (props: AppointedByBlockProps) => {

    return (
        <AppSelect
            bordered
            label={"Задачу создал"}
            variant={'select'}
            style={{minWidth: 250}}
            value={props.value}
            readOnly
            getOptionLabel={(option: Employee) => getEmployeeName(option, 'listNameInitials')}
            colorScheme={'lightInput'}
        />
    );
};
