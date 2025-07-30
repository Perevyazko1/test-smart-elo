import type {IEarning} from "@/entities/salary";
import {type IWeek, toRuDate} from "@/shared/utils/date";


import {DeleteEarningBtn} from "@/widgets/cash/actions/DeleteEarningBtn.tsx";
import {EditEarningBtn} from "@/widgets/cash/actions/EditEarningBtn.tsx";
import {getUserName} from "@/shared/utils/getUserName.ts";


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
                {isPositive && (Math.abs(earning.amount).toLocaleString('ru-RU'))}</td>
            <td className={'text-end'}>
                {!isPositive && (Math.abs(earning.amount).toLocaleString('ru-RU'))}</td>
            <td className={'text-end'}>
                {balance.toLocaleString('ru-RU')}</td>
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