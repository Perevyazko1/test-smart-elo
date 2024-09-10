import {AppSelect} from "@shared/ui";
import {useEmployeeName} from "@shared/hooks";


interface AppointedByBlockProps {
    value: number | null;
}


export const AppointedByBlock = (props: AppointedByBlockProps) => {
    const {value} = props;

    const {getNameById, isLoading} = useEmployeeName();

    return (
        <AppSelect
            variant={'select'}
            colorScheme={'lightInput'}
            bordered
            className={'flex-fill'}
            label={"Задачу назначил"}
            style={{minWidth: '250px'}}
            value={value}
            readOnly
            isLoading={isLoading}
            getOptionLabel={(option: number) => getNameById(option, 'listNameInitials')}
        />
    );
};
