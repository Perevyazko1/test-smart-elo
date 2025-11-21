import {useEffect, useState} from "react";
import type {IUser} from "@/entities/user";
import {Dropdown} from "@/shared/ui/inputs/Dropdown.tsx";
import {useUsers} from "@/shared/utils/useUsers.ts";

interface IProps {
    defaultValue?: number | null;
    onChange?: (value: number | null) => void;
    disabled?: boolean;
}

export function SelectUser(props: IProps) {
    const {defaultValue, onChange, disabled = false} = props;

    const {data: users, isLoading} = useUsers();
    const [selectedUser, setSelectedUser] = useState<IUser | null>();

    const handleSelect = (item: IUser | null | undefined) => {
        setSelectedUser(item);
        onChange?.(item?.id || null);
    }

    useEffect(() => {
        if (!isLoading) {
            setSelectedUser(users?.find(user => user.id === defaultValue) || null);
        }
    }, [isLoading]);

    return (
        <Dropdown<IUser>
            className={'bg-yellow-50 text-black'}
            items={users}
            disabled={disabled}
            selectedItem={selectedUser}
            setSelectedItem={handleSelect}
            getItemLabel={(item) => item ?
                `${item.last_name} ${item.first_name?.slice(0)}`
                : isLoading ? "Загрузка..." : "Выбрать"}
        />
    );
}