import {toast} from "sonner";
import {useEffect, useState} from "react";
import {FormProvider, useForm, useWatch} from "react-hook-form";

import {APP_PERM, type IUser} from "@/entities/user";
import {$axios} from "@/shared/api";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {TextAreaForm} from "@/shared/ui/inputs/TextInputForm.tsx";
import {PriceInputForm} from "@/shared/ui/inputs/PriceInputForm.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {usePermission} from "@/shared/utils/permissions.ts";

interface UserPanelWidgetProps {
    user: IUser;
}

export const UserPanelWidget = (props: UserPanelWidgetProps) => {
    const {user} = props;

    const [userData, setUserData] = useState(user);

    const methods = useForm<Partial<IUser>>({
        defaultValues: {
            description: user.description,
            piecework_amount: user.piecework_amount,
        }
    });

    const client = useQueryClient();

    const updateUserData = (data: Partial<IUser>) => {
        toast.promise($axios.patch<IUser>(`/staff/employees/${user.id}/`, {
                ...data
            }), {
                loading: 'Применение изменений',
                success: (data) => {
                    client.invalidateQueries({
                            queryKey: ['payrollRows']
                        }
                    );
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

    const piecework_amount = useWatch({
        control: methods.control,
        name: "piecework_amount"
    });

    const dUpdateData = useDebounce(
        (data: {
            description?: string;
            piecework_amount?: number;
        }) => updateUserData({
            ...data,
        }),
        1000
    )

    useEffect(() => {
        if (description !== userData.description) {
            dUpdateData({description});
        }
    }, [description]);

    useEffect(() => {
        if (piecework_amount !== userData.piecework_amount) {
            dUpdateData({piecework_amount});
        }
    }, [piecework_amount]);

    const canEditUser = usePermission([
        APP_PERM.WAGES_PAGE,
        APP_PERM.ADMIN,
    ]);

    return (
        <FormProvider {...methods}>
            <div className={'flex flex-col gap-3 p-2 border border-black'}>
                <div>
                    <b>{userData.first_name || ""} {userData.last_name || ""}</b>
                </div>

                {canEditUser && (
                    <div className="relative">
                        <div className={'flex items-center h-full text-[0.8em] w-1/2 gap-2'}>
                            <span>Комментарий:</span>

                            <TextAreaForm
                                className={'p-2 resize-none w-full bg-yellow-50 disabled:bg-transparent'}
                                name={'description'}
                            />
                        </div>
                    </div>
                )}

                <div className={'flex flex-col gap-2'}>
                    <div className={'flex gap-3 items-center'}>
                    <span>
                        Форма оплаты:
                    </span>
                        <b>{userData.piecework_wages ? "Сделка" : "Оклад"}</b>
                        {canEditUser && (
                            <Btn
                                onClick={() => {
                                    updateUserData({piecework_wages: !userData.piecework_wages});
                                }}
                            >
                                Переключить на {userData.piecework_wages ? "Оклад" : "Сделка"}
                            </Btn>
                        )}
                    </div>

                    {!userData.piecework_wages && (
                        <div className={'flex gap-2 items-center'}>
                            <span>Ставка в час:</span>

                            <PriceInputForm
                                name={'piecework_amount'}
                                disabled={!canEditUser}
                                className={'p-2 w-[5em] text-end bg-yellow-50 disabled:bg-transparent'}
                            />
                        </div>
                    )}
                </div>
            </div>
        </FormProvider>
    );
};