import {AppSelect} from "@shared/ui";
import {useAppQuery, useCurrentUser} from "@shared/hooks";
import {Department, useDepartmentList} from "@entities/Department";


export const DepartmentDropdown = (props: {piecework_wages?: boolean}) => {
    const {setQueryParam, queryParameters} = useAppQuery();
    const {currentUser} = useCurrentUser();
    const {data, isLoading} = useDepartmentList({});

    const targetDepartments = data?.filter(
        item => currentUser.departments?.includes(item.id)
            && (!props.piecework_wages || item.piecework_wages)
    ) || [];

    const setDepartmentClb = (department: Department | null) => {
        setQueryParam('department__id', department ? String(department.id) : '')
    };

    return (
        <AppSelect
            variant={"select"}
            label={'Отдел'}
            isLoading={isLoading}
            value={data?.find(item => item.id === Number(queryParameters.department__id)) || null}
            options={targetDepartments}
            getOptionLabel={item => item ? item.name : "Все отделы"}
            onSelect={item => setDepartmentClb(item)}
            colorScheme={'darkInput'}
        />
    );
};
