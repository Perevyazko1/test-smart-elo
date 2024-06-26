import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";


interface AppointedByBlockProps {
    value?: Employee;
}


export const AppointedByBlock = (props: AppointedByBlockProps) => {
    const {value} = props;

    return (
        <Autocomplete
            size={'small'}
            disablePortal
            readOnly
            value={value}
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
                    label="Задачу назначил"
                    variant="standard"
                />}
        />
    );
};
