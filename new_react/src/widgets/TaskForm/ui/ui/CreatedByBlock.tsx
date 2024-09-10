import {AppSelect} from "@shared/ui";
import {useEmployeeName} from "@shared/hooks";


interface AppointedByBlockProps {
    value: number | null;
}


export const CreatedByBlock = (props: AppointedByBlockProps) => {
    const {getNameById} = useEmployeeName();

    return (
        <AppSelect
            bordered
            label={"Задачу создал"}
            variant={'select'}
            style={{minWidth: 250}}
            value={props.value}
            readOnly
            getOptionLabel={(option: number) => getNameById(option, 'listNameInitials')}
            colorScheme={'lightInput'}
        />
    );
};
