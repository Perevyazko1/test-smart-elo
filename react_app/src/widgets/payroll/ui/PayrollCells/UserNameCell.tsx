import {Toggle} from "@/components/ui/toggle.tsx";
import {EnterIcon, ExitIcon, LockClosedIcon} from "@radix-ui/react-icons";
import {LockOpen} from "lucide-react";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {TT} from "@/shared/ui/tooltip/TT.tsx";
import type {IPayrollRow} from "@/entities/salary";
import {type IUpdatePayrollRow, payrollService} from "@/widgets/payroll/model/api.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {AxiosResponse} from "axios";
import type {IWeek} from "@/shared/utils/date.ts";
import {Link} from "react-router-dom";


interface UserNameCellProps {
    userInfo: IPayrollRow;
    mutateClb: (args: IUpdatePayrollRow) => void;
    isPending: boolean;
    week: IWeek;
}


export const UserNameCell = (props: UserNameCellProps) => {
    const {userInfo, mutateClb, isPending, week} = props;

    const queryClient = useQueryClient();

    const closeRow = useMutation({
        mutationFn: payrollService.closePayrollRow,
        onSuccess: (updatedData: AxiosResponse<IPayrollRow>) => {
            queryClient.setQueryData(['payrollRows', week.weekNumber], (oldRows: { data: IPayrollRow[] }) => {
                return {
                    ...oldRows,
                    data: oldRows.data.map(row =>
                        row.id === updatedData.data.id ? updatedData.data : row
                    )
                }
            });
            queryClient.setQueryData(['payrollRows', updatedData.data.id], updatedData.data);
            queryClient.invalidateQueries({queryKey: ['payrollRows', week.weekNumber + 1]});
        }
    });

    const closeWeekRowHandle = () => {
        if (window.confirm(`${userInfo.is_closed ? "Открыть" : "Закрыть"} расчеты по текущей неделе с сотрудником для расчета баланса?`)) {
            closeRow.mutate({
                payroll_row_id: userInfo.id,
                close: !userInfo.is_closed,
            })
        }
    }

    return (
        <td>
            <div className="flex justify-between flex-nowrap">
                <div className="flex items-center">
                    <TT asChild description={'Заблокировать изменение суммы к выплате'}>
                        <Toggle
                            disabled={isPending}
                            className={'cursor-pointer noPrint'}
                            pressed={userInfo.is_locked}
                            onPressedChange={() => mutateClb({
                                id: userInfo.id,
                                is_locked: !userInfo.is_locked
                            })}
                        >
                            {userInfo.is_locked ? (
                                <LockClosedIcon className={'text-red-800'}/>
                            ) : (
                                <LockOpen className={'text-green-800'}/>
                            )}
                        </Toggle>
                    </TT>

                    <TT asChild description={"Перейти в детализацию по сотруднику"}>
                        <Link
                            className={"text-nowrap inline-block text-left"}
                            to={`/user_wage/${userInfo.user.id}/${week.date_from}/${week.date_to}/`}
                        >
                            {userInfo.name}
                        </Link>
                    </TT>

                </div>

                <TT asChild description={`${userInfo.is_closed ? "Открыть" : "Закрыть"} неделю по сотруднику`}>
                    <Btn
                        disabled={userInfo.has_unconfirmed}
                        className={'text-16 bg-transparent px-2 noPrint'}
                        name={'Payroll'}
                        onClick={closeWeekRowHandle}
                    >
                        {userInfo.is_closed ? (
                            <EnterIcon/>
                        ) : (
                            <ExitIcon/>
                        )}
                    </Btn>
                </TT>
            </div>
        </td>
    )
        ;
};