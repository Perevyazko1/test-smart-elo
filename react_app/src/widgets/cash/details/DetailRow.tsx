import type {IEarning} from "@/entities/salary";
import {type IWeek, toRuDate} from "@/shared/utils/date";


import {DeleteEarningBtn} from "@/widgets/cash/actions/DeleteEarningBtn.tsx";
import {EditEarningBtn} from "@/widgets/cash/actions/EditEarningBtn.tsx";
import {getUserName} from "@/shared/utils/getUserName.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";


interface DetailRowProps {
    earning: IEarning;
    balance: number;
    week: IWeek;
}


export const DetailRow = (props: DetailRowProps) => {
    const {earning, balance, week} = props;

    const isPositive = earning.amount > 0;

    return (
        <tr className={'text-[.8em]'}>
            <td>{toRuDate(earning.target_date)}</td>
            <td className={'text-[.9em]'}>Касса</td>
            <td className={'text-[.9em]'}>{getUserName(earning.user)}</td>
            <td className={'text-[.9em]'}>{earning.comment}</td>
            <td className={'text-end'}>
                {isPositive && <NiceNum value={earning.amount} abs/>}</td>
            <td className={'text-end'}>
                {!isPositive && <NiceNum value={earning.amount} abs/>}</td>
            <td className={'text-end'}>
                <NiceNum value={balance}/>
            </td>
            <td>
                <div className={'flex items-center gap-1 scale-90'}>
                    {!earning.is_locked && (
                        <>
                            <DeleteEarningBtn
                                amount={earning.amount}
                                earningId={earning.id!}
                            />

                            <EditEarningBtn
                                earning={earning}
                                week={week}
                            />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};