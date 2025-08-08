import {useMutation, useQueryClient} from "@tanstack/react-query";
import {CheckIcon, TrashIcon} from "@radix-ui/react-icons";
import {toast} from "sonner";

import {TD} from "@/shared/ui/table/TD.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {earningService} from "@/widgets/salary/accrual/model/api.ts";
import type {IEarning} from "@/entities/salary";
import {AppModal} from "@/shared/ui/modal/AppModal.tsx";
import {EarningDetail} from "@/widgets/salary/detail/table/EarningDetail.tsx";
import {EditEarningBtn} from "@/widgets/cash/actions/EditEarningBtn.tsx";
import {getToday, toRuDate} from "@/shared/utils/date.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";

interface SalaryDetailRowProps {
    earning: IEarning;
    selectedUserId: number;
}

export const SalaryDetailRow = (props: SalaryDetailRowProps) => {
    const {earning} = props;

    const qClient = useQueryClient();

    const mutateRow = useMutation({
        mutationFn: () => {
            return earningService.deleteEarning({earning_id: earning.id!});
        },
        onSuccess: () => {
            qClient.invalidateQueries({queryKey: ['salaryDetail']});
            toast.success("Начисление успешно удалено!")
        }
    });

    const onDeleteHandle = () => {
        mutateRow.mutate();
    };

    const isAdmin = usePermission([
        APP_PERM.ADMIN,
    ]);

    const wagesAccess = usePermission([
        APP_PERM.WAGES_PAGE,
    ])

    const canEdit = isAdmin || (wagesAccess && !earning.approval_by);

    return (
        <tr>
            <TD className={'text-nowrap'}>
                <AppModal
                    trigger={
                        <div className={'cursor-pointer'}>
                            {new Date(earning.target_date).toLocaleString(
                                "ru", {day: 'numeric', month: 'long'}
                            )}
                        </div>
                    }
                    content={
                        <EarningDetail
                            earning={earning}
                        />
                    }
                    title={
                        `Начисление № ${earning.id} от ${toRuDate(earning.target_date, false)}`
                    }
                    description={
                        `Детализация по начислению`
                    }
                />
            </TD>
            <TD>
                {earning.earning_type}
            </TD>
            <TD className={'text-[.8em]'}>
                {earning.comment}
            </TD>
            <TD className={'relative'}>
                {earning.earning_comment}

                <div className={'absolute top-1 -right-6 flex flex-nowrap gap-1 items-center'}>
                    {canEdit && (
                        <EditEarningBtn
                            earning={earning}
                            target_date={getToday()}
                        />
                    )}

                    {!!earning.approval_by && (
                        <CheckIcon color={'green'} className={'opacity-50'}/>
                    )}

                    {canEdit && (
                        <Btn
                            disabled={mutateRow.isPending}
                            className={'rounded-full bg-black p-[.25em]'}
                            onClick={onDeleteHandle}
                        >
                            <TrashIcon color={'red'}/>
                        </Btn>
                    )}

                </div>
            </TD>
            <TD className={'text-end'}>
                <NiceNum value={earning.amount}/>
            </TD>
        </tr>
    );
};