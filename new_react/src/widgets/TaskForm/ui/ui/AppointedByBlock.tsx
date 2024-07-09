import {Autocomplete, TextField} from "@mui/material";
import {Employee} from "@entities/Employee";
import {getEmployeeName} from "@shared/lib";
import {useMemo} from "react";


interface AppointedByBlockProps {
    value: number | null;
    userList: Employee[];
    isLoading: boolean;
}


export const AppointedByBlock = (props: AppointedByBlockProps) => {
    const {value, userList, isLoading} = props;
    
    const getValue = useMemo(() => {
        return userList.find(user => user.id === value) || null;
    }, [userList, value])

    return (
        <Autocomplete
            size={'small'}
            disablePortal
            readOnly
            value={getValue}
            options={[]}
            getOptionLabel={(option: Employee) => getEmployeeName(option, 'listNameInitials')}
            sx={{
                width: 250,
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
                    label={isLoading ? "Загрузка..." : "Задачу назначил"}
                    variant="standard"
                />}
        />
    );
};
