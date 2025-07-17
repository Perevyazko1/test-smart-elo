import {type ChangeEvent, useState} from "react";
import {ArrowRight} from "lucide-react";
import {twMerge} from "tailwind-merge";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {IWeek} from "@/shared/utils/date.ts";

import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {useDebounce} from "@/shared/utils/useDebounce.tsx";

import {PayrollTable} from "./ui/PayrollTable/PayrollTable.tsx";
import {SALARY_STATUSES} from "@/shared/consts";
import type {IPayroll} from "@/entities/salary";
import {payrollService} from "./model/api.ts";


interface SalaryPayrollWidgetProps {
    setSelectedUserId: (arg: number) => void;
    currentWeek: IWeek;
}


export const SalaryPayrollWidget = (props: SalaryPayrollWidgetProps) => {
    const {setSelectedUserId, currentWeek} = props;
    const queryClient = useQueryClient();
    const [cashValue, setCashValue] = useState<number>();

    const createPayrollMutation = useMutation({
        mutationFn: payrollService.createNewPayroll,
        onSuccess: () => {
            window.location.reload();
        }
    });

    const updatePayroll = useMutation({
        mutationFn: (data: Partial<IPayroll>) => {
            return payrollService.updatePayroll({
                ...data,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['payroll', currentWeek.weekNumber],
            });
        }
    });

    const {data, isFetching} = useQuery({
        queryKey: ['payroll', currentWeek.weekNumber],
        queryFn: () => {
            return payrollService.getPayroll({
                date_from: currentWeek.date_from,
            });
        },
    });

    const debouncedUpdatePayroll = useDebounce(
        (data: {
            cash_payout?: number;
        }) => updatePayroll.mutate({
            date_from: currentWeek.date_from,
            cash_payout: data.cash_payout,
        }),
        1500
    );

    if (isFetching) {
        return <div>Загрузка...</div>
    }

    const setPayrollStatus = (status: keyof typeof SALARY_STATUSES) => {
        updatePayroll.mutate({
            date_from: currentWeek.date_from,
            state: status,
        });
    }

    const issuedChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value.replace(/[^\d]/g, ''));

        if (isNaN(value) || value < 0) {
            return;
        }

        setCashValue(value);
        debouncedUpdatePayroll({cash_payout: value});
    }

    const statusLessThen = (status: keyof typeof SALARY_STATUSES) => {
        return Number(data?.data?.state) < Number(status);
    }

    return (
        <div className={'p-3 overflow-auto'}>
            <div className={'flex gap-8 bg-yellow-100 p-3 items-center'}>
                <div className={'flex flex-col'}>
                    <h1 className={"text-xl font-bold"}>
                        Ведомость за {currentWeek.weekNumber} нед.
                    </h1>
                    <div className={'flex gap-2 items-center'}>
                        К ВЫДАЧЕ:
                        <input
                            disabled={!statusLessThen("4")}
                            type="text"
                            className={'p-2 w-1/3 outline-none border-none text-center h-full bg-white disabled:bg-transparent'}
                            value={cashValue?.toLocaleString('ru-RU') || data?.data?.cash_payout.toLocaleString('ru-RU')}
                            onChange={issuedChangeHandle}
                        />
                    </div>

                </div>

                <div className={'flex items-center gap-3 text-sm'}>
                    {Object.entries(SALARY_STATUSES).map(([status, statusName], index) => (
                        <Btn
                            type={'button'}
                            onClick={() => setPayrollStatus(status as keyof typeof SALARY_STATUSES)}
                            key={status}
                            className={twMerge([
                                'flex items-center gap-2 bg-transparent',
                                data?.data?.state === status
                                    ? 'text-yellow-800'
                                    : Number(data?.data?.state) < Number(status)
                                        ? 'text-gray-500'
                                        : 'text-green-800',
                            ])}>
                            <div>
                                <div className={'font-bold underline underline-offset-2'}>
                                    Этап {status}
                                </div>
                                <div>
                                    {statusName}
                                </div>
                            </div>
                            {index < 5 && (
                                <div>
                                    <ArrowRight/>
                                </div>
                            )}
                        </Btn>
                    ))}

                </div>
            </div>

            {(!data?.data) ? (
                <Btn
                    onClick={() => {
                        createPayrollMutation.mutate({
                            date_from: currentWeek.date_from,
                        });
                    }}
                    disabled={createPayrollMutation.isPending}
                >
                    {createPayrollMutation.isPending ? 'Формирование...' : 'Сформировать ведомость'}
                </Btn>
            ) : (
                <PayrollTable
                    currentWeek={currentWeek}
                    setSelectedUserId={setSelectedUserId}
                    payroll={data.data}
                />
            )}
        </div>
    );
};