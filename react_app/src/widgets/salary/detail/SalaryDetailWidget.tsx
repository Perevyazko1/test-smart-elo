import {SalaryDetailRow} from "@/widgets/salary/detail/table/SalaryDetailRow.tsx";
import {SalaryWeekInfoRow} from "@/widgets/salary/detail/table/SalaryWeekInfoRow.tsx";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";

interface SalaryDetailWidgetProps {
    selectedUserId: number;
}

export const SalaryDetailWidget = (props: SalaryDetailWidgetProps) => {
    const {selectedUserId} = props;

    return (
        <div className={'p-3'}>
            <h1 className={"text-xl mb-4"}>
                <b>Детализация по сотруднику {selectedUserId}</b>
            </h1>

            <div className={'bg-gray-200 pb-10 pt-3 px-4'}>
                <div className={'p-2 border border-black'}>
                    <b>Петров Петр</b>
                </div>
                <div className={'flex items-center w-fit border gap-3 px-3 mb-5'}>
                    <div>
                        Текущая задолженность:
                    </div>
                    <div className={'text-lg'}>
                        <b>23 658 Р.</b>
                    </div>
                </div>

                <div className={'flex gap-10 justify-between min-w-0 overflow-auto max-w-full'}>
                    <div className={'flex flex-col flex-1'}>
                        <div
                            className={'p-1 px-4 border border-gray-300 bg-white w-fit'}
                        >
                            Отработка за 27 неделю
                        </div>

                        <Table>
                            <THead>
                            <tr>
                                <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                    Изделие / Тип начисления
                                </th>
                                <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                    Цена
                                </th>
                                <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                                    Кол-во
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
                            <SalaryDetailRow/>
                            <SalaryDetailRow/>
                            <SalaryDetailRow/>
                            <SalaryDetailRow/>

                            <tr className={'bg-gray-200 text-nowrap'}>
                                <th
                                    colSpan={2}
                                    className="py-2 px-4 border border-gray-300 text-right"
                                >
                                    <b>Итого:</b>
                                </th>
                                <th
                                    className="py-2 px-3 border border-gray-300 text-left"
                                >
                                    <b>12</b>
                                </th>
                                <th
                                    colSpan={2}
                                    className="py-2 px-4 border border-gray-300 text-left"
                                >
                                    <b>25 200 Р.</b>
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
                            <SalaryWeekInfoRow/>
                            <SalaryWeekInfoRow/>
                            <SalaryWeekInfoRow/>
                            <SalaryWeekInfoRow/>
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};