import {type ChangeEvent, useEffect, useState} from "react";
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
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import {DotFilledIcon} from "@radix-ui/react-icons";
import {toast} from "sonner";
import {useHideSum} from "@/shared/state/payroll/hideSum.ts";


interface SalaryPayrollWidgetProps {
    currentWeek: IWeek;
}


export const SalaryPayrollWidget = (props: SalaryPayrollWidgetProps) => {
    const {currentWeek} = props;
    const queryClient = useQueryClient();
    const [cashValue, setCashValue] = useState<number | null>();
    const [descriptionValue, setDescriptionValue] = useState<string | null>();
    const hideSum = useHideSum(s => s.hideSum);

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
            toast.success("Ведомость обновлена ✔️")
            queryClient.invalidateQueries({
                queryKey: ['payroll', currentWeek.weekNumber],
            });
        }
    });

    const {data, isLoading} = useQuery({
        queryKey: ['payroll', currentWeek.weekNumber],
        queryFn: () => payrollService.getPayroll({
            date_from: currentWeek.date_from,
        }),
    });

    useEffect(() => {
        if (cashValue !== data?.data?.cash_payout) {
            setCashValue(data?.data?.cash_payout);
        }
        if (descriptionValue !== data?.data?.description) {
            setDescriptionValue(data?.data?.description);
        }
    }, [data?.data, currentWeek.weekNumber]);

    const debouncedUpdatePayroll = useDebounce(
        (data: {
            cash_payout?: number;
            description?: string;
        }) => updatePayroll.mutate({
            date_from: currentWeek.date_from,
            ...data,
        }),
        2000
    );

    if (isLoading) {
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

    const descriptionChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        setDescriptionValue(e.target.value);
        debouncedUpdatePayroll({description: e.target.value});
    }

    const statusLessThen = (status: keyof typeof SALARY_STATUSES) => {
        return Number(data?.data?.state) < Number(status);
    }

    const payrollData = data?.data;

    return (
        <div className={'p-3 print:p-0 relative mt-13'} style={{
            maxHeight: 'calc(100dvh - 100px)',
        }}>

            <div className={'flex gap-8 bg-yellow-100 p-3 print:p-0 pb-1 items-center'}>
                <div className={'flex flex-col'}>
                    <h1 className={"text-xl font-bold"}>
                        Ведомость за {currentWeek.weekNumber} нед.
                    </h1>
                    <div className={'flex gap-2 items-center'}>
                        ФОТ ПЛАН:
                        {!hideSum && (
                            <input
                                id={`${currentWeek.weekNumber}cash`}
                                disabled={!statusLessThen("4")}
                                type="text"
                                className={'p-2 w-1/3 outline-none border-none text-center h-full bg-white disabled:bg-transparent'}
                                value={cashValue?.toLocaleString('ru-RU') || data?.data?.cash_payout?.toLocaleString('ru-RU')}
                                onChange={issuedChangeHandle}
                            />
                        )}
                    </div>

                </div>

                <div className={'flex items-center gap-3 text-sm'}>
                    {Object.entries(SALARY_STATUSES).map(([status, statusName], index) => (
                        <Btn
                            type={'button'}
                            onClick={() => setPayrollStatus(status as keyof typeof SALARY_STATUSES)}
                            key={status}
                            className={twMerge([
                                'flex items-center gap-2 bg-transparent noPrint',
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

            <div className={'relative'}>
                <div className={'flex items-center h-full text-[0.8em]'}>
                    {!hideSum && (
                        <TextArea
                            id={`${currentWeek.weekNumber}description`}
                            placeholder={'Комментарий к неделе'}
                            disabled={!statusLessThen("6")}
                            value={descriptionValue || ""}
                            onChange={descriptionChangeHandle}
                            className={'p-2 resize-none w-full bg-yellow-50'}
                        />
                    )}
                </div>
                {descriptionValue !== data?.data?.description && (
                    <DotFilledIcon
                        className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                    />
                )}
            </div>

            {(!payrollData) && (
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
            )}

            {payrollData && (
                <PayrollTable
                    currentWeek={currentWeek}
                    payrollId={payrollData.id}
                    state={payrollData.state}
                />
            )}
        </div>
    );
};