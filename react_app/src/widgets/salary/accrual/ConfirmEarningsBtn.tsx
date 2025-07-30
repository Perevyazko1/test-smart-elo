import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import {CheckCircle} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {earningService} from "@/widgets/salary/accrual/model/api.ts";
import type {IWeek} from "@/shared/utils/date.ts";
import type {AxiosResponse} from "axios";
import type {IPayrollRow} from "@/entities/salary";


interface ConfirmEarningsBtnProps {
    active: boolean;
    week: IWeek;
    userId: number;
}

export const ConfirmEarningsBtn = (props: ConfirmEarningsBtnProps) => {
    const {active, week, userId} = props;

    const queryClient = useQueryClient();

    const updateEarnings = useMutation({
        mutationFn: earningService.confirmEarnings,
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
        }
    })

    const clickHandle = () => {
        updateEarnings.mutate({
            date_from: week.date_from,
            date_to: week.date_to,
            user_id: userId,
        })
    }

    return (
        <Btn
            onClick={clickHandle}
            disabled={updateEarnings.isPending}
            className={twMerge([
                'text-green-800 p-2',
                active
                    ? ""
                    : "opacity-0 cursor-not-allowed pointer-events-none"
            ])}
        >
            <CheckCircle size={16}/>
        </Btn>
    );
};