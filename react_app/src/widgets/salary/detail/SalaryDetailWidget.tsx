import {SalaryDetailRow} from "@/widgets/salary/detail/table/SalaryDetailRow.tsx";
import {SalaryWeekInfoRow} from "@/widgets/salary/detail/table/SalaryWeekInfoRow.tsx";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {useQuery} from "@tanstack/react-query";
import {salaryDetailService} from "@/widgets/salary/detail/model/api";
import type {IWeek} from "@/shared/utils/date.ts";

interface SalaryDetailWidgetProps {
    selectedUserId: number;
    currentWeek: IWeek;
}

export const SalaryDetailWidget = (props: SalaryDetailWidgetProps) => {
    const {selectedUserId, currentWeek} = props;

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

    const detailTotalSum = details.detail_report?.reduce(
        (acc, item) => acc + item.amount, 0
    ) || 0;

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
                        <div
                            className={'p-1 px-4 border border-gray-300 bg-white w-fit'}
                        >
                            Отработка за {currentWeek.weekNumber} Нед.
                        </div>

                        <Table>
                            <THead>
                                <tr>
                                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                        Дата
                                    </th>
                                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                        Тип начисления
                                    </th>
                                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                        Изделие / Описание
                                    </th>
                                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                        Сумма
                                    </th>
                                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                        Примечание
                                    </th>
                                </tr>
                            </THead>


                            <tbody>
                            {details.detail_report?.map((row) => (
                                <SalaryDetailRow
                                    key={row.id}
                                    name={row.comment}
                                    earning_type={row.earning_type}
                                    sum={row.amount}
                                    date={row.target_date}
                                    comment={row.earning_comment}
                                />
                            ))}

                            <tr className={'bg-gray-200 text-nowrap'}>
                                <th
                                    colSpan={3}
                                    className="py-2 px-4 border border-gray-300 text-right"
                                >
                                    <b>Итого:</b>
                                </th>
                                <th
                                    colSpan={2}
                                    className="py-2 px-4 border border-gray-300 text-left"
                                >
                                    <b>{detailTotalSum.toLocaleString("ru-RU")} Р.</b>
                                </th>
                            </tr>
                            </tbody>
                        </Table>
                    </div>

                    <div>
                        <Table>
                            <THead>
                                <tr>
                                    <th
                                        colSpan={3}
                                        className={'py-1 px-2 border-b border-gray-300 text-left'}
                                    >
                                        Сводное инфо по неделям
                                    </th>
                                </tr>
                            </THead>

                            <tbody>
                            {details.week_report?.map(item => (
                                <SalaryWeekInfoRow
                                    key={item.id}
                                    earning={item}
                                />

                            ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};