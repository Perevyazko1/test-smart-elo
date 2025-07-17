import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import {CheckCircle} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {earningService} from "@/widgets/salary/accrual/model/api.ts";
import type {IWeek} from "@/shared/utils/date.ts";


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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['payrollRows', week.weekNumber]
            });
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
            bg={'white'}
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