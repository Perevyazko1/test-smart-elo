import {SalaryDetailRow} from "@/widgets/salary/detail/table/SalaryDetailRow.tsx";
import {SalaryWeekInfoRow} from "@/widgets/salary/detail/table/SalaryWeekInfoRow.tsx";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {useQuery} from "@tanstack/react-query";
import {salaryDetailService} from "@/widgets/salary/detail/model/api";
import type {IWeek} from "@/shared/utils/date.ts";
import {DetailTable} from "@/widgets/salary/detail/table/DetailTable.tsx";
import {useState} from "react";
import {DetailGroupedTable} from "@/widgets/salary/detail/table/DetailGroupedTable.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {WeekDetailsTable} from "@/widgets/salary/detail/table/WeekDetailsTable.tsx";

interface SalaryDetailWidgetProps {
    selectedUserId: number;
    currentWeek: IWeek;
}

export const SalaryDetailWidget = (props: SalaryDetailWidgetProps) => {
    const {selectedUserId, currentWeek} = props;

    const [showDetail, setShowDetail] = useState(false);

    const {data, isFetching} = useQuery({
        queryKey: ['salaryDetail', currentWeek.weekNumber, selectedUserId],
        queryFn: () => {
            return salaryDetailService.getUserInfo({
                date_from: currentWeek.date_from,
                date_to: currentWeek.date_to,
                user_id: selectedUserId,
            });
        },
    });

    if (isFetching) {
        return (<div>Загрузка...</div>)
    }

    if (!data?.data) {
        return (<div>Ошибка получения детализации</div>)
    }

    const details = data.data;

    return (
        <div className={'p-3'}>
            <h1 className={"text-xl mb-4"}>
                <b>Детализация по сотруднику {details.user_info.id}</b>
            </h1>

            <div className={'bg-gray-200 pb-10 pt-3 px-4'}>
                <div className={'p-2 border border-black'}>
                    <b>{details.user_info.name}</b>
                </div>
                <div className={'flex items-center w-fit border gap-3 px-3 mb-5'}>
                    <div>
                        Текущая задолженность:
                    </div>
                    <div className={'text-lg'}>
                        <b>{details.user_info.balance.toLocaleString("ru-RU")} Р.</b>
                    </div>
                </div>

                <div className={'flex gap-10 justify-between min-w-0 overflow-auto max-w-full'}>
                    <div className={'flex flex-col flex-1'}>
                        <Btn
                            className={'p-1 px-4 border border-gray-300 bg-white w-fit text-black'}
                            onClick={() => setShowDetail(!showDetail)}
                        >
                            Отработка за {currentWeek.weekNumber} Нед.
                        </Btn>

                        {showDetail ?
                            <DetailTable
                                earnings={details.detail_report}
                            /> :
                            <DetailGroupedTable
                                earnings={details.detail_report}
                            />
                        }

                    </div>

                    <div>
                        <WeekDetailsTable
                            earnings={details.week_report}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};