import {toast} from "sonner";
import {type ChangeEvent, useState} from "react";

import type {IUser} from "@/entities/user";
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import {$axios} from "@/shared/api";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";

interface UserPanelWidgetProps {
    user: IUser;
}

export const UserPanelWidget = (props: UserPanelWidgetProps) => {
    const {user} = props;

    const [userData, setUserData] = useState(user);

    const updateUserData = (data: Partial<IUser>) => {
        toast.promise($axios.patch<IUser>(`/staff/employees/${user.id}/`, {
                ...data
            }), {
                loading: 'Применение изменений',
                success: (data) => {
                    setUserData(data.data);
                    return 'Данные пользователя успешно обновлены';
                },
                error: 'Ошибка изменения данных о пользователе',
            }
        )
    }

    const dUpdateData = useDebounce(
        (data: {
            description?: string;
        }) => updateUserData({
            ...data,
        }),
        1000
    )

    const commentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const value = e.target.value;
        setUserData({...userData, description: value});
        dUpdateData({description: value});
    }

    const amountChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value.replace(/[^\d]/g, ''));
        if (isNaN(value) || value < 0) {
            return;
        }
        setUserData({...userData, piecework_amount: value});
        dUpdateData({piecework_amount: value});
    }


    return (
        <div className={'flex flex-col gap-3 p-2 border border-black'}>
            <div>
                <b>{userData.first_name || ""} {userData.last_name || ""}</b>
            </div>
            <div className="relative">
                <div className={'flex items-center h-full text-[0.8em] w-1/2 gap-2'}>
                    <span>Комментарий:</span>

                    <TextArea
                        className={'p-2 resize-none w-full bg-yellow-50 disabled:bg-transparent'}
                        value={userData.description}
                        onChange={commentChangeHandle}
                    />
                </div>
            </div>
            <div className={'flex flex-col gap-2'}>
                <div className={'flex gap-3 items-center'}>
                    <span>
                        Форма оплаты:
                    </span>
                    <b>{userData.piecework_wages ? "Сделка" : "Оклад"}</b>
                    <Btn
                        onClick={() => {
                            updateUserData({piecework_wages: !userData.piecework_wages});
                        }}
                    >
                        Переключить на {userData.piecework_wages ? "Оклад" : "Сделка"}
                    </Btn>
                </div>

                {!userData.piecework_wages && (
                    <div className={'flex gap-2 items-center'}>
                        <span>Ставка в час:</span>
                        <input
                            className={'p-2 w-[5em] text-end bg-yellow-50 disabled:bg-transparent'}
                            value={userData.piecework_amount || 0}
                            type="number"
                            onChange={amountChangeHandle}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};