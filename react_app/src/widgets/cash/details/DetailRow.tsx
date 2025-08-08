import type {IEarning} from "@/entities/salary";
import {getToday, toRuDate} from "@/shared/utils/date";

import {DeleteEarningBtn} from "@/widgets/cash/actions/DeleteEarningBtn.tsx";
import {EditEarningBtn} from "@/widgets/cash/actions/EditEarningBtn.tsx";
import {getUserName} from "@/shared/utils/getUserName.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";
import {EarningDetail} from "@/widgets/salary/detail/table/EarningDetail.tsx";
import {AppModal} from "@/shared/ui/modal/AppModal.tsx";


interface DetailRowProps {
    earning: IEarning;
    balance: number;
}


export const DetailRow = (props: DetailRowProps) => {
    const {earning, balance} = props;

    const isPositive = earning.amount > 0;

    const isAdmin = usePermission(APP_PERM.ADMIN);
    const wagesAccess = usePermission(APP_PERM.WAGES_PAGE);

    const createdAt = new Date(earning.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    const canEdit = isAdmin || (wagesAccess && hoursSinceCreation <= 1);


    return (
        <tr className={'text-[.8em]'}>
            <td className={'text-nowrap'}>
                <AppModal
                    trigger={
                        <div className={'cursor-pointer font-mono'}>
                            {toRuDate(earning.cash_date, false)}
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
            </td>
            <td className={'text-[.9em]'}>Касса</td>
            <td className={'text-[.9em]'}>{getUserName(earning.user)}</td>
            <td className={'text-[.9em]'} colSpan={2}>{earning.comment}</td>
            <td className={'text-end'}>
                {isPositive && <NiceNum value={earning.amount} abs/>}</td>
            <td className={'text-end'}>
                {!isPositive && <NiceNum value={earning.amount} abs/>}</td>
            <td className={'text-end'}>
                <NiceNum value={balance}/>
            </td>
            <td className={'w-[4em]'}>
                <div className={'flex items-center gap-1 scale-90'}>
                    {canEdit && (
                        <>
                            <DeleteEarningBtn
                                amount={earning.amount}
                                earningId={earning.id!}
                            />

                            <EditEarningBtn
                                earning={earning}
                                target_date={getToday()}
                            />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};