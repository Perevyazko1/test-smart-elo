import {toast} from "sonner";
import {useEffect, useState} from "react";

import {type IUser} from "@/entities/user";
import {$axios} from "@/shared/api";
import {UserPanelForm} from "@/widgets/salary/detail/widgets/UserPanelForm.tsx";

interface UserPanelWidgetProps {
    userId: number;
}

export const UserPanelWidget = (props: UserPanelWidgetProps) => {
    const {userId} = props;

    const [userData, setUserData] = useState<IUser>();

    useEffect(() => {
        if (!userData) {
            $axios.get<IUser>(`/staff/employees/${userId}/`).then(res => {
                setUserData(res.data);
            })
        }
    }, [userData]);

    if (!userData) return null;

    return (
        <UserPanelForm
            user={userData}
        />
    );
};