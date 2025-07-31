import {type ReactNode, useState} from "react";
import {twMerge} from "tailwind-merge";
import {EditIcon} from "lucide-react";

import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import type {ICreateEarning, IEarning, IEarningType} from "@/entities/salary";
import {CreateEarningForm} from "@/widgets/salary/accrual/CreateEarningForm.tsx";
import {AppModal} from "@/shared/ui/modal/AppModal.tsx";
import type {IWeek} from "@/shared/utils/date";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {earningService} from "@/widgets/salary/accrual/model/api.ts";

interface EditEarningBtnProps {
    earning: IEarning;
    children?: ReactNode;
    week: IWeek;
}

export const EditEarningBtn = (props: EditEarningBtnProps) => {
    const {earning, children, week} = props;

    const {currentUser} = useCurrentUser();

    const [modalOpen, setModalOpen] = useState(false);

    const titleMap: Record<IEarningType, string> = {
        "ИП": `Изменить выдачу ИП №${earning.id}`,
        "ЗАЙМ": `Изменить займ №${earning.id}`,
        "ПОГ.ЗАЙМА": `Изменить погашение займа №${earning.id}`,
        "ДОП": `Изменить ДОП сотруднику №${earning.id}`,
        "На карту": `Изменить начисление на карту №${earning.id}`,
        "Налог": `Изменить удержание налога сотруднику №${earning.id}`,
        "Выдача НАЛ":
            !earning.user
                ? `Изменить выдачу ДС под закупки №${earning.id}`
                : `Изменить выдачу наличных ДС сотруднику №${earning.id}`,
        "Внесение НАЛ": `Изменить поступление ДС в кассу №${earning.id}`,
        "ЭЛО": `Внести системное начисление ЭЛО сотруднику №${earning.id}`,
    }

    const title = titleMap[earning.earning_type]

    const descriptionMap: Record<IEarningType, string> = {
        "ИП": "Данный расчет будет добавлен в ведомость к сумме выданных средств на ИП",
        "ЗАЙМ": "Данное начисление будет добавлено в раздел займов. Не относится к балансу заработной платы",
        "ПОГ.ЗАЙМА": "Погашение займа будет учтено в столбце займов. Не относится к балансу заработной платы",
        "ДОП": "Данное начисление будет добавлено в ведомость к сумме ДОП заработанных средств",
        "На карту": "Данный расчет будет добавлен в ведомость к сумме выданных средств на карту",
        "Налог": "Данный расчет будет добавлен в ведомость к сумме удержанных налогов и сборов",
        "Выдача НАЛ":
            !earning.user
                ? "Выдача ДС из кассы под закупки. ВНИМАНИЕ - выдача ДС под зарплату производится на странице ведомостей."
                : "Данный расчет будет добавлен в ведомость к сумме выданных ДС наличного расчета",
        "Внесение НАЛ": "Внести поступление ДС на баланс в кассу",
        "ЭЛО": "Данное начисление будет добавлено в ведомость к сумме ЭЛО заработанных средств",
    }
    const description = descriptionMap[earning.earning_type]

    const client = useQueryClient();

    const updateEarning = useMutation({
        mutationFn: (data: ICreateEarning) => {
            return earningService.updateEarning({
                id: earning.id!,
                ...data,
                created_by: currentUser?.id!,
                amount: ["ЭЛО", "ДОП", "Внесение НАЛ"].includes(earning.earning_type) ? data.amount : -data.amount,
                ...(["На карту", "Налог", "Выдача НАЛ", "Внесение НАЛ"].includes(earning.earning_type) ?
                        {approval_by: currentUser?.id!} : {}
                ),
            });
        },
        onSuccess: () => {
            client.invalidateQueries({
                queryKey: ['payrollRows', week.weekNumber]
            });
            client.invalidateQueries({
                queryKey: ['cashDetail']
            });
            client.invalidateQueries({
                queryKey: ['salaryDetail']
            });

            setModalOpen(false);

            setTimeout(() => {
                document.getElementById(`payrollRow${earning.user}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 1000)
        }
    });

    return (
        <AppModal
            title={title}
            description={description}
            open={modalOpen}
            onOpenChange={setModalOpen}
            trigger={
                children ? children :
                    <Btn
                        className={twMerge(
                            'p-1 bg-black rounded-2xl border-1',
                            'opacity-50 hover:opacity-100',
                            'text-yellow-400 border-yellow-800',
                        )}
                    >
                        <EditIcon size={12}/>
                    </Btn>
            }
            content={
                <CreateEarningForm
                    amount={Math.abs(earning.amount)}
                    about={earning.comment}
                    week={week}
                    disabled={updateEarning.isPending}
                    earning_type={earning.earning_type}
                    createdById={currentUser!.id!}
                    user={earning.user}
                    onSubmit={updateEarning.mutate}
                />
            }
        />

    );
};