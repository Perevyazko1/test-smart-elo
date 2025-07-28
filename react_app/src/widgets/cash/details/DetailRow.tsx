import type {IEarning} from "@/entities/salary";
import type {IWeek} from "@/shared/utils/date";


import {DeleteEarningBtn} from "@/widgets/cash/actions/DeleteEarningBtn.tsx";
import {EditEarningBtn} from "@/widgets/cash/actions/EditEarningBtn.tsx";


interface DetailRowProps {
    earning: IEarning;
    balance: number;
    week: IWeek;
}


export const DetailRow = (props: DetailRowProps) => {
    const {earning, balance, week} = props;

    return (
        <tr>
            <td>Касса</td>
            <td>{earning.user_name}</td>
            <td>{earning.comment}</td>
            <td>{Math.abs(earning.amount > 0 ? earning.amount : 0).toLocaleString('ru-RU')}</td>
            <td>{Math.abs(earning.amount < 0 ? earning.amount : 0).toLocaleString('ru-RU')}</td>
            <td>{balance.toLocaleString('ru-RU')}</td>
            <td className={'flex items-center gap-1'}>
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
            </td>
        </tr>
    );
};