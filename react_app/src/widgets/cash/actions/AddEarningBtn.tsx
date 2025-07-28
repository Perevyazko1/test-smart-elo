import {useMutation, useQueryClient} from "@tanstack/react-query";
import {PlusCircle} from "lucide-react";

import type {IEarning, IEarningType} from "@/entities/salary";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {AppModal} from "@/shared/ui/modal/AppModal.tsx";

import {CreateEarningForm} from "../../salary/accrual/CreateEarningForm.tsx";
import {earningService} from "../../salary/accrual/model/api.ts";
import type {IWeek} from "@/shared/utils/date.ts";
import {type ReactNode, useState} from "react";
import {twMerge} from "tailwind-merge";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";


interface AddEarningBtnProps {
    earning_type: IEarningType;
    userId: number | null;
    week: IWeek;
    disabled: boolean;
    about?: string;
    children?: ReactNode;
}

export const AddEarningBtn = (props: AddEarningBtnProps) => {
    const {earning_type, userId, week, disabled, about, children} = props;
    const queryClient = useQueryClient();
    const {currentUser} = useCurrentUser();

    const [modalOpen, setModalOpen] = useState(false);

    const titleMap: Record<IEarningType, string> = {
        "ДОП": "Начислить ДОП сотруднику",
        "На карту": "Внести выдачу на карту сотруднику",
        "Налог": "Внести удержание налога сотруднику",
        "Выдача НАЛ":
            !userId
                ? "Выдать ДС под закупки"
                : "Внести выдачу наличных ДС сотруднику",
        "Внесение НАЛ": "Внести поступление ДС в кассу",
        "ЭЛО": "Внести системное начисление ЭЛО сотруднику",
    }

    const title = titleMap[earning_type]

    const descriptionMap: Record<IEarningType, string> = {
        "ДОП": "Данное начисление будет добавлено в ведомость к сумме ДОП заработанных средств",
        "На карту": "Данный расчет будет добавлен в ведомость к сумме выданных средств на карту",
        "Налог": "Данный расчет будет добавлен в ведомость к сумме удержанных налогов и сборов",
        "Выдача НАЛ":
            !userId
                ? "Внести выдачу ДС из кассы под закупки. ВНИМАНИЕ - выдача ДС под зарплату производится на странице ведомостей."
                : "Данный расчет будет добавлен в ведомость к сумме выданных ДС наличного расчета",
        "Внесение НАЛ": "Внести поступление ДС на баланс в кассу",
        "ЭЛО": "Данное начисление будет добавлено в ведомость к сумме ЭЛО заработанных средств",
    }

    const description = descriptionMap[earning_type]

    const createEarningMutation = useMutation({
        mutationFn: (data: Omit<IEarning, 'id'>) => {
            return earningService.createEarning({
                ...data,
                created_by: currentUser?.id!,
                amount: ["ЭЛО", "ДОП", "Внесение НАЛ"].includes(earning_type) ? data.amount : -data.amount,
                ...(["На карту", "Налог", "Выдача НАЛ", "Внесение НАЛ"].includes(earning_type) ?
                        {approval_by: currentUser?.id!} : {}
                ),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['payrollRows', week.weekNumber]
            });
            queryClient.invalidateQueries({
                queryKey: ['cashDetail']
            });

            setTimeout(() => {
                document.getElementById(`payrollRow${userId}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 1000)
        }
    });

    const submitHandle = (data: IEarning) => {
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
                    <Btn
                        disabled={disabled}
                        onClick={() => setModalOpen(true)}
                        className={twMerge([
                            'text-sm p-2 opacity-25 hover:opacity-100 disabled:opacity-25 disabled:text-black',
                            ["ДОП", "ЭЛО"].includes(earning_type) ? "text-green-800" : "text-yellow-800",
                        ])}
                    >
                        <PlusCircle size={16}/>
                    </Btn>
            }
            content={
                <CreateEarningForm
                    about={about}
                    week={week}
                    disabled={createEarningMutation.isPending}
                    earning_type={earning_type}
                    createdById={1}
                    userId={userId}
                    onSubmit={submitHandle}
                />
            }
        />

    );
};