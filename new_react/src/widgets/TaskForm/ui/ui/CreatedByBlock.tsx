import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import {AppAutocomplete} from "@pages/TestPage/ui/AppAutocomplete";


interface AppointedByBlockProps {
    value: Employee;
}


export const CreatedByBlock = (props: AppointedByBlockProps) => {

    return (
        <AppAutocomplete
            variant={'select'}
            value={props.value}
            label={"Задачу создал"}
            width={250}
            readOnly
            getOptionLabel={(option: Employee) => getEmployeeName(option, 'listNameInitials')}
        />
    );
};
