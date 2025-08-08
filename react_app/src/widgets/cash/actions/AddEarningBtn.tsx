import {useMutation, useQueryClient} from "@tanstack/react-query";
import {MinusCircle, PlusCircle} from "lucide-react";

import type {ICreateEarning, IEarningType} from "@/entities/salary";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {AppModal} from "@/shared/ui/modal/AppModal.tsx";

import {CreateEarningForm} from "../../salary/accrual/CreateEarningForm.tsx";
import {earningService} from "../../salary/accrual/model/api.ts";
import {type ReactNode, useState} from "react";
import {twMerge} from "tailwind-merge";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import type {IUser} from "@/entities/user";


interface AddEarningBtnProps {
    earning_type: IEarningType;
    user: IUser | null;
    target_date: string;
    disabled: boolean;
    about?: string;
    info: string;
    children?: ReactNode;
    targetIsCashDate?: boolean;
}

export const AddEarningBtn = (props: AddEarningBtnProps) => {
    const {earning_type, info, user, target_date, disabled, about, children, targetIsCashDate = false} = props;
    const queryClient = useQueryClient();
    const {currentUser} = useCurrentUser();

    const [modalOpen, setModalOpen] = useState(false);

    const titleMap: Record<IEarningType, string> = {
        "ИП": "Внести выдаче средств на ИП сотрудника",
        "ЗАЙМ": "Выдать займ сотруднику",
        "ПОГ.ЗАЙМА": "Внести погашение займа сотрудником",
        "ДОП": "Начислить ДОП сотруднику",
        "На карту": "Внести выдачу на карту сотруднику",
        "Налог": "Внести удержание налога сотруднику",
        "Выдача НАЛ":
            !user
                ? "Выдать ДС под закупки"
                : "Внести выдачу наличных ДС сотруднику",
        "Внесение НАЛ": "Внести поступление ДС в кассу",
        "ЭЛО": "Внести системное начисление ЭЛО сотруднику",
    }

    const title = titleMap[earning_type]

    const descriptionMap: Record<IEarningType, string> = {
        "ИП": "Данный расчет будет добавлен в ведомость к сумме выданных средств на ИП сотрудника",
        "ЗАЙМ": "Данное начисление будет добавлено в раздел займов. Не относится к балансу заработной платы",
        "ПОГ.ЗАЙМА": "Погашение займа будет учтено в столбце займов. Не относится к балансу заработной платы",
        "ДОП": "Данное начисление будет добавлено в ведомость к сумме ДОП заработанных средств",
        "На карту": "Данный расчет будет добавлен в ведомость к сумме выданных средств на карту",
        "Налог": "Данный расчет будет добавлен в ведомость к сумме удержанных налогов и сборов",
        "Выдача НАЛ":
            !user
                ? "Внести выдачу ДС из кассы под закупки. ВНИМАНИЕ - выдача ДС под зарплату производится на странице ведомостей."
                : "Данный расчет будет добавлен в ведомость к сумме выданных ДС наличного расчета",
        "Внесение НАЛ": "Внести поступление ДС на баланс в кассу",
        "ЭЛО": "Данное начисление будет добавлено в ведомость к сумме ЭЛО заработанных средств",
    }

    const description = descriptionMap[earning_type]

    const createEarningMutation = useMutation({
        mutationFn: (data: ICreateEarning) => {
            return earningService.createEarning({
                ...data,
                created_by: currentUser?.id!,
                amount: ["ЭЛО", "ДОП", "Внесение НАЛ", "ЗАЙМ"].includes(earning_type) ? data.amount: -data.amount,
                ...(["На карту", "Налог", "Выдача НАЛ", "Внесение НАЛ", "ПОГ.ЗАЙМА", "ЗАЙМ", "ИП"].includes(earning_type) ?
                        {approval_by: currentUser?.id!} : {}
                ),
                ...(targetIsCashDate ? {
                    cash_date: data.target_date,
                } : {}),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['payrollRows']
            });
            queryClient.invalidateQueries({
                queryKey: ['cashDetail']
            });

            setTimeout(() => {
                document.getElementById(`payrollRow${user?.id}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 2000)
        }
    });

    const submitHandle = (data: ICreateEarning) => {
        createEarningMutation.mutate(data);
        setModalOpen(false);
    }


    return (
        <AppModal
            title={title}
            description={description}
            open={modalOpen}
            onOpenChange={setModalOpen}
            trigger={
                children ? children :
                    <TT asChild description={info}>
                        <Btn
                            disabled={disabled}
                            onClick={() => setModalOpen(true)}
                            className={twMerge([
                                'text-sm p-2 pe-1 opacity-25 hover:opacity-100 disabled:opacity-25 disabled:text-black',
                                ["ДОП", "ЭЛО", "ЗАЙМ"].includes(earning_type) ? "text-green-800" : "text-yellow-800",
                            ])}
                        >
                            {["ДОП", "ЭЛО", "ЗАЙМ"].includes(earning_type) ?
                                <PlusCircle size={16}/>
                                :
                                <MinusCircle size={16}/>
                            }
                        </Btn>
                    </TT>
            }
            content={
                <CreateEarningForm
                    about={about}
                    target_date={target_date}
                    disabled={createEarningMutation.isPending}
                    earning_type={earning_type}
                    createdById={1}
                    user={user}
                    onSubmit={submitHandle}
                />
            }
        />

    );
};