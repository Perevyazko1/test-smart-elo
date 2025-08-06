import type {IEarning} from "@/entities/salary";
import {getToday, toRuDate} from "@/shared/utils/date";


import {DeleteEarningBtn} from "@/widgets/cash/actions/DeleteEarningBtn.tsx";
import {EditEarningBtn} from "@/widgets/cash/actions/EditEarningBtn.tsx";
import {getUserName} from "@/shared/utils/getUserName.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";


interface DetailRowProps {
    earning: IEarning;
    balance: number;
}


export const DetailRow = (props: DetailRowProps) => {
    const {earning, balance} = props;

    const isPositive = earning.amount > 0;

    const canEdit = usePermission(APP_PERM.ADMIN)

    return (
        <tr className={'text-[.8em]'}>
            <td className={'text-nowrap'}>{toRuDate(earning.cash_date)}</td>
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