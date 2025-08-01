import {toast} from "sonner";
import {type ChangeEvent, useEffect, useState} from "react";
import {FormProvider, useForm, useWatch} from "react-hook-form";

import type {IUser} from "@/entities/user";
import {$axios} from "@/shared/api";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {TextAreaForm} from "@/shared/ui/inputs/TextInputForm.tsx";
import {PriceInputForm} from "@/shared/ui/inputs/PriceInputForm.tsx";

interface UserPanelWidgetProps {
    user: IUser;
}

export const UserPanelWidget = (props: UserPanelWidgetProps) => {
    const {user} = props;

    const [userData, setUserData] = useState(user);

    const methods = useForm<Partial<IUser>>({
        defaultValues: {
            description: user.description,
        }
    });

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

    const description = useWatch({
        control: methods.control,
        name: "description"
    });

    const dUpdateData = useDebounce(
        (data: {
            description?: string;
        }) => updateUserData({
            ...data,
        }),
        1000
    )

    useEffect(() => {
        if (description !== userData.description) {
            dUpdateData({description: description});
        }
    }, [description]);

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
        <FormProvider {...methods}>
            <div className={'flex flex-col gap-3 p-2 border border-black'}>
                <div>
                    <b>{userData.first_name || ""} {userData.last_name || ""}</b>
                </div>
                <div className="relative">
                    <div className={'flex items-center h-full text-[0.8em] w-1/2 gap-2'}>
                        <span>Комментарий:</span>

                        <TextAreaForm
                            className={'p-2 resize-none w-full bg-yellow-50 disabled:bg-transparent'}
                            name={'description'}
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

                            <PriceInputForm
                                name={'piecework_amount'}
                            />
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
        </FormProvider>
    );
};