import {useQuery} from "@tanstack/react-query";
import {salaryDetailService} from "@/widgets/salary/detail/model/api";
import {getToday, toRuDate} from "@/shared/utils/date.ts";
import {DetailTable} from "@/widgets/salary/detail/table/DetailTable.tsx";
import {useState} from "react";
import {DetailGroupedTable} from "@/widgets/salary/detail/table/DetailGroupedTable.tsx";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {Switch} from "@/components/ui/switch";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";
import {UserPanelWidget} from "@/widgets/salary/detail/widgets/UserPanelWidget.tsx";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";

interface SalaryDetailWidgetProps {
    selectedUserId: number;
    date_from: string;
    date_to: string;
}

export const SalaryDetailWidget = (props: SalaryDetailWidgetProps) => {
    const {selectedUserId, date_from, date_to} = props;

    const [showDetail, setShowDetail] = useState(false);

    const canAddLoan = usePermission([
        APP_PERM.WAGES_PAGE,
        APP_PERM.ADMIN,
    ]);

    const {data, isFetching} = useQuery({
        queryKey: ['salaryDetail', `${date_from}_${date_to}`, selectedUserId],
        queryFn: () => {
            return salaryDetailService.getUserInfo({
                date_from: date_from,
                date_to: date_to,
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
                <b>Детализация по сотруднику {details.user_info.user.id}</b>
            </h1>

            <div className={'bg-gray-200 pb-10 pt-3 px-4'}>
                <UserPanelWidget
                    userId={details.user_info.user.id!}
                />

                <div className={'flex items-center w-fit border gap-3 px-3 mb-5'}>
                    <div>
                        Текущая задолженность:
                    </div>
                    <div className={'flex flex-nowrap text-lg gap-2'}>
                        <NiceNum value={details.user_info.balance}/> Р.
                    </div>
                    {canAddLoan && (
                        <AddEarningBtn
                            info={"Внести выдачу займа сотруднику"}
                            disabled={isFetching}
                            target_date={getToday()}
                            user={details.user_info.user}
                            earning_type={"ЗАЙМ"}
                        />
                    )}
                </div>

                <div className={'flex flex-col gap-5 justify-between min-w-0 overflow-auto max-w-full'}>
                    <div className={'flex flex-col flex-1 p-4'}>
                        <div className={'flex gap-3 items-center bg-amber-100'}>
                            <Btn
                                className={'p-1 px-4 border border-gray-300 bg-white w-fit text-black'}
                                onClick={() => setShowDetail(!showDetail)}
                            >
                                Отработка c {toRuDate(date_from)} по {toRuDate(date_to)}.
                            </Btn>
                            <div className={'flex items-center gap-2'}>
                                <label htmlFor="showDetail">Показать детализацию</label>
                                <Switch
                                    id={"showDetail"}
                                    checked={showDetail}
                                    onCheckedChange={() => setShowDetail(!showDetail)}
                                />
                            </div>

                        </div>

                        {showDetail ?
                            <DetailTable
                                earnings={details.detail_report}
                                selectedUserId={selectedUserId}
                            /> :
                            <DetailGroupedTable
                                earnings={details.detail_report?.filter(item =>
                                    ["ЭЛО", "ДОП"].includes(item.earning_type)
                                )}
                            />
                        }

                    </div>

                    <div className={'px-4'}>
                        <table className={'w-full border-collapse border border-black bg-white'}>
                            <thead>
                            <tr>
                                <th>НЕД</th>
                                <th>НА НАЧ НЕД</th>
                                <th>Начислено ДОП</th>
                                <th>Начислено ЭЛО</th>
                                <th>Выдано НАЛ</th>
                                <th>Выдано ИП</th>
                                <th>Выдано БН</th>
                                <th>НДФЛ</th>
                                <th>Займы</th>
                                <th>ОСТАТОК</th>
                            </tr>
                            </thead>

                            <tbody>
                            {details.week_report?.map(item => (
                                <tr key={item.id} className={'text-end'}>
                                    <td>{item.week}</td>
                                    <td><NiceNum value={item.hide_balance ? null : item.balance_sum}/></td>
                                    <td><NiceNum value={item.bonus_sum}/></td>
                                    <td><NiceNum value={item.earned_sum}/></td>
                                    <td><NiceNum value={item.issued_sum}/></td>
                                    <td><NiceNum value={item.ip_sum}/></td>
                                    <td><NiceNum value={item.card_sum}/></td>
                                    <td><NiceNum value={item.tax_sum}/></td>
                                    <td><NiceNum value={item.loan_sum}/></td>
                                    <td><NiceNum value={item.hide_balance ? null :
                                        (item.balance_sum || 0) +
                                        (item.bonus_sum || 0) +
                                        (item.earned_sum || 0) +
                                        (item.issued_sum || 0) +
                                        (item.ip_sum || 0) +
                                        (item.card_sum || 0) +
                                        (item.tax_sum || 0) +
                                        (item.loan_sum || 0)
                                    }/></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};