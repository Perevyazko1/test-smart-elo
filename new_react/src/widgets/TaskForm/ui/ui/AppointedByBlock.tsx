import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";


interface AppointedByBlockProps {
    value: Employee;
}


export const AppointedByBlock = (props: AppointedByBlockProps) => {

    return (
        <Autocomplete
            className={'mb-3'}
            size={'small'}
            disablePortal
            readOnly
            defaultValue={props.value}
            options={[]}
            getOptionLabel={(option: Employee) => getEmployeeName(option)}
            sx={{width: 200}}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label="Задачу назначил"
                    variant="standard"
                />}
        />
    );
};
