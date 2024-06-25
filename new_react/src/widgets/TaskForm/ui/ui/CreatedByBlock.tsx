import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";


interface AppointedByBlockProps {
    value: Employee;
}


export const CreatedByBlock = (props: AppointedByBlockProps) => {

    return (
        <Autocomplete
            size={'small'}
            disablePortal
            readOnly
            defaultValue={props.value}
            options={[]}
            getOptionLabel={(option: Employee) => getEmployeeName(option)}
            sx={{
                width: 200,
                "& .MuiAutocomplete-popupIndicator": {
                    display: "none",
                },
                "& .MuiAutocomplete-clearIndicator": {
                    display: "none",
                },
            }}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label="Задачу создал"
                    variant="standard"
                />}
        />
    );
};
