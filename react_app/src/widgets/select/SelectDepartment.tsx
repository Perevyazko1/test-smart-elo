import {useEffect, useState} from "react";
import {Dropdown} from "@/shared/ui/inputs/Dropdown.tsx";
import {useDepartments} from "@/shared/utils/useDepartments.ts";
import type {IDepartment} from "@/entities/department";

interface IProps {
    defaultValue?: number | null;
    onChange?: (value: number | null) => void;
}

export function SelectDepartment(props: IProps) {
    const {defaultValue, onChange} = props;

    const {data: departments, isLoading} = useDepartments();
    const [selectedDepartment, setSelectedDepartment] = useState<IDepartment | null>();
    const handleSelect = (item: IDepartment | null | undefined) => {
        setSelectedDepartment(item);
        onChange?.(item?.id || null);
    }

    useEffect(() => {
        if (!isLoading) {
            setSelectedDepartment(departments?.find(department => department.id === defaultValue) || null);
        }
    }, [isLoading]);

    return (
        <Dropdown<IDepartment>
            className={'bg-yellow-50 text-black'}
            items={departments}
            selectedItem={selectedDepartment}
            setSelectedItem={handleSelect}
            getItemLabel={(item) => item ?
                `${item.name}`
                : isLoading ? "Загрузка..." : "Выбрать"}
        />
    );
}