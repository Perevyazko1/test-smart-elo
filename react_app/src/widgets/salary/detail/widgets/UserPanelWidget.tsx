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
import {SelectUser} from "@/widgets/select/SelectUser.tsx";
import {SelectDepartment} from "@/widgets/select/SelectDepartment.tsx";
import {useDepartments} from "@/shared/utils/useDepartments.ts";
import {twMerge} from "tailwind-merge";

interface UserPanelWidgetProps {
    user: IUser;
}

export const UserPanelWidget = (props: UserPanelWidgetProps) => {
    const {user} = props;

    const [userData, setUserData] = useState(user);
    const {data: departments, isLoading} = useDepartments();

    interface IUserForm extends Pick<IUser,
        'first_name' |
        'last_name' |
        'patronymic' |
        'description' |
        'boss' |
        'piecework_wages' |
        'piecework_amount'
    > {
        permanent_department: number | null;
    }

    const methods = useForm<Partial<IUserForm>>({
        defaultValues: {
            first_name: user.first_name,
            last_name: user.last_name,
            patronymic: user.patronymic,
            description: user.description,
            piecework_amount: user.piecework_amount,
            permanent_department: user.permanent_department,
            boss: user.boss,
        }
    });

    const client = useQueryClient();

    const updateUserData = (data: Partial<IUserForm>) => {
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

    const watchedValues = useWatch({control: methods.control});
    const dUpdateData = useDebounce(
        () => updateUserData({
            ...watchedValues,
        }),
        2000
    )

    useEffect(() => {
        const hasChanges = Object.entries(watchedValues).some(([key, value]) => {
            return userData[key as keyof IUserForm] !== value;
        });

        if (hasChanges) {
            dUpdateData();
        }
    }, [watchedValues, userData]);

    const canEditUser = usePermission([
        APP_PERM.HR,
        APP_PERM.ADMIN,
    ]);

    const canAddEarnings = usePermission([
        APP_PERM.WAGES_ADD_TRANSACTION,
        APP_PERM.ADMIN,
    ]);

    return (
        <FormProvider {...methods}>
            <div className={'flex gap-3 p-2 border border-black'}>
                <div className={'flex flex-col flex-1 gap-2'}>
                    {/*Блок имя*/}
                    <div className={'flex gap-2'}>
                        <div className={'flex flex-col'}>
                            <span className={"text-sm"}>Фамилия</span>
                            <TextAreaForm
                                className={'p-2 resize-none bg-yellow-50'}
                                name={'last_name'}
                                disabled={!canEditUser}
                                maxLength={255}
                                rows={1}
                                placeholder={'Фамилия'}
                            />
                        </div>
                        <div className={'flex flex-col'}>
                            <span className={"text-sm"}>Имя</span>
                            <TextAreaForm
                                className={'p-2 resize-none bg-yellow-50'}
                                name={'first_name'}
                                disabled={!canEditUser}
                                maxLength={255}
                                rows={1}
                                placeholder={'Имя'}
                            />
                        </div>

                        <div className={'flex flex-col'}>
                            <span className={"text-sm"}>Отчество</span>
                            <TextAreaForm
                                className={'p-2 resize-none bg-yellow-50'}
                                name={'patronymic'}
                                disabled={!canEditUser}
                                maxLength={255}
                                placeholder={'Отчество'}
                                rows={1}
                            />
                        </div>
                    </div>
                    {/*Блок комментарий и сделка*/}
                    <div>
                        {(canEditUser || canAddEarnings) && (
                            <div className="relative">
                                <div className={'flex flex-col h-full text-[0.8em] w-1/2'}>
                                    <span>Особенности расчета:</span>

                                    <TextAreaForm
                                        className={'p-2 resize-none w-full bg-yellow-50 disabled:bg-transparent'}
                                        name={'description'}
                                        disabled={!canEditUser}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>

                        <div className={'flex gap-3 items-center'}>
                            <div className={'flex gap-2 items-center'}>
                                <span
                                    className={"text-sm"}
                                >
                                    Форма оплаты: <b>{userData.piecework_wages ? "Сделка" : "Оклад"}</b>
                                </span>
                                {canEditUser && (
                                    <Btn
                                        className={'max-w-content text-sm bg-yellow-50'}
                                        onClick={() => {
                                            updateUserData({piecework_wages: !userData.piecework_wages});
                                        }}
                                    >
                                        Изменить
                                    </Btn>
                                )}
                            </div>

                            {!userData.piecework_wages && (
                                <div className={'flex gap-2 items-center mt-1'}>
                                    <span>Ставка в час:</span>

                                    <PriceInputForm
                                        name={'piecework_amount'}
                                        disabled={!canEditUser}
                                        className={'px-2 py-1 w-[5em] text-end bg-yellow-50 disabled:bg-transparent'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className={'flex flex-col gap-2'}>
                    <div className={'flex flex-col'}>
                        <span className={"text-sm"}>Начальник:</span>
                        <SelectUser
                            defaultValue={user.boss}
                            disabled={!canEditUser}
                            onChange={(value) => {
                                methods.setValue('boss', value);
                            }}
                        />
                    </div>

                    <div className={'flex flex-col'}>
                        <span className={"text-sm"}>Отдел:</span>
                        <SelectDepartment
                            disabled={!canEditUser}
                            defaultValue={user.permanent_department}
                            onChange={(value) => {
                                methods.setValue('permanent_department', value);
                            }}
                        />
                    </div>

                    <div className={'flex flex-col'}>
                        <span className={"text-sm"}>Доступ к отделам ЭЛО:</span>
                        {isLoading ?
                            "Загрузка" : (
                                <div className={'flex gap-2 flex-wrap'}>
                                    {departments?.map((department) => (
                                        <Btn
                                            key={department.id}
                                            className={
                                                twMerge(
                                                    userData.departments.includes(department.id) ? 'bg-green-300' : 'bg-red-300',
                                                    'p-0 px-1 text-sm'
                                                )
                                            }
                                        >
                                            {department.name}
                                        </Btn>))}
                                </div>
                            )
                        }
                    </div>
                </div>

            </div>

        </FormProvider>
    );
};