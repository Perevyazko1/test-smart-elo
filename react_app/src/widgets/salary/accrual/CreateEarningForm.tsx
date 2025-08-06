import {type ChangeEvent, type FormEvent, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import type {ICreateEarning, IEarningType} from "@/entities/salary";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {APP_PERM, type IUser} from "@/entities/user";
import {useClipboard} from "use-clipboard-copy";
import {CopyIcon} from "lucide-react";
import {toast} from "sonner";
import {TextAreaForm} from "@/shared/ui/inputs/TextInputForm.tsx";
import {PriceInputForm} from "@/shared/ui/inputs/PriceInputForm.tsx";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {usePermission} from "@/shared/utils/permissions";


interface CreateEarningFormProps {
    onSubmit?: (data: ICreateEarning) => void;
    user: IUser | null;
    createdById: number;
    earning_type: IEarningType;
    disabled?: boolean;
    target_date: string;
    about?: string;
    amount?: number;
}


export const CreateEarningForm = (props: CreateEarningFormProps) => {
    const {onSubmit, amount, target_date, about, disabled = true, earning_type, user, createdById} = props;
    const clipboardAmount = useClipboard();
    const clipboardComment = useClipboard();


    const methods = useForm<ICreateEarning>({
        defaultValues: {
            amount: amount || undefined,
            user_id: user?.id || null,
            created_by: createdById,
            target_date: target_date,
            earning_type: earning_type,
            comment: about
        }
    });

    const [weekData, setWeekData] = useState({
        "ПН": {hours: 8, minutes: 0},
        "ВТ": {hours: 8, minutes: 0},
        "СР": {hours: 8, minutes: 0},
        "ЧТ": {hours: 8, minutes: 0},
        "ПТ": {hours: 8, minutes: 0},
        "СБ": {hours: 0, minutes: 0},
        "ВС": {hours: 0, minutes: 0},
    });

    const onSubmitHandler = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            methods.handleSubmit(onSubmit)(e);
        }
    };

    const weekDataChangeHandle = (e: ChangeEvent<HTMLInputElement>, day: string, type: 'hours' | 'minutes') => {
        const value = e.target.value;
        let newValue = parseInt(value, 10);

        if (isNaN(newValue) || newValue < 0) {
            newValue = 0;
        }

        if (type === 'minutes' && newValue > 59) {
            newValue = 59;
        }

        if (type === 'hours' && newValue > 24) {
            newValue = 24;
        }

        setWeekData(prev => ({
            ...prev,
            [day]: {
                ...prev[day as keyof typeof prev],
                [type]: newValue
            }
        }));
    }

    const totalMinutes = Object.values(weekData).reduce((sum, time) => sum + (time.hours || 0) * 60 + (time.minutes || 0), 0);
    const totalHours = Math.ceil((totalMinutes / 60) * 100) / 100;
    const totalAmountInCents = totalMinutes * (user?.piecework_amount || 0) / 60;
    const totalAmount = Math.ceil(totalAmountInCents) / 100;


    const getRecommendedComment = () => {
        const daysStr = Object.entries(weekData)
            .filter(([_, time]) => time.hours > 0 || time.minutes > 0)
            .map(([day, time]) => {
                const parts = [];
                if (time.hours > 0) parts.push(`${time.hours}ч`);
                if (time.minutes > 0) parts.push(`${time.minutes}м`);
                return `${day}: ${parts.join(' ')}`;
            })
            .join(', ');
        return `${about} - ${totalHours} часов (${daysStr})`;
    }

    const copyAmountHandle = () => {
        clipboardAmount.copy();
        toast.success("Сумма скопирована");
    }

    const copyCommentHandle = () => {
        clipboardComment.copy();
        toast.success("Комментарий скопирован");
    }

    const canSetDate = usePermission(APP_PERM.ADMIN);


    return (
        <div className={'flex flex-nowrap gap-4'}>
            <FormProvider {...methods}>
                <form onSubmit={onSubmitHandler} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor={"amount"}>
                            Сумма
                        </label>

                        <PriceInputForm
                            placeholder="Сумма"
                            className={'bg-white p-2 w-full'}
                            disabled={disabled}
                            name={"amount"}
                        />
                    </div>

                    <div className="space-y-2">
                        <TextAreaForm
                            placeholder="Комментарий"
                            required
                            disabled={disabled}
                            className={'bg-white p-2 w-full min-w-[30em]'}
                            name={'comment'}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor={"target_date"}>
                            Дата закрепления
                        </label>
                        <br/>
                        <input
                            id={"target_date"}
                            disabled={!canSetDate}
                            className={'bg-white p-2'}
                            type="date"
                            {...methods.register("target_date", {required: "Дата закрепления обязательна"})}
                        />
                    </div>

                    <Btn
                        className={'px-8 py-2 bg-black text-white'}
                        disabled={disabled}
                        type="submit"
                    >
                        {amount ?
                            "Изменить"
                            :
                            "Создать"
                        }
                    </Btn>
                </form>
            </FormProvider>

            {(!user?.piecework_wages && earning_type === "ДОП") && (
                <div className={'flex flex-col gap-3'}>

                    <div className={'flex gap-3'}>
                        {Object.entries(weekData).map(([day, value], index) => (
                            <div key={index} className="flex flex-col gap-2 items-center">
                                <span>{day}</span>
                                <input
                                    className={'p-2 py-1 w-14 text-end bg-yellow-50 disabled:bg-transparent'}
                                    value={value.hours || ''}
                                    min={0}
                                    max={24}
                                    placeholder="ч"
                                    type="number"
                                    onChange={(e) => weekDataChangeHandle(e, day, 'hours')}
                                />
                                <input
                                    className={'p-2 py-1 w-14 text-end bg-yellow-50 disabled:bg-transparent'}
                                    value={value.minutes || ''}
                                    min={0}
                                    max={59}
                                    placeholder="м"
                                    type="number"
                                    onChange={(e) => weekDataChangeHandle(e, day, 'minutes')}
                                />
                            </div>
                        ))}
                    </div>
                    <hr/>
                    <div className={'flex gap-2'}>
                        Часов: <b>{totalHours}</b> Ставка: <b><NiceNum value={user?.piecework_amount || 0}/></b>
                    </div>
                    <hr/>

                    <div
                        onClick={copyAmountHandle}
                        className="cursor-pointer flex flex-nowrap gap-3"
                    >
                        <div className={'flex'}>
                            Оклад <CopyIcon size={10}/>:
                        </div>
                        <input
                            type="text"
                            className={'pointer-events-none w-[6em]'}
                            ref={clipboardAmount.target}
                            value={totalAmount.toLocaleString('ru-RU')}
                            readOnly
                        />
                    </div>

                    <hr/>
                    <div
                        onClick={copyCommentHandle}
                        className="cursor-pointer flex flex-col gap-3"
                    >
                        <div className={'flex'}>
                            Комментарий <CopyIcon size={10}/>:
                        </div>

                        <textarea
                            className={'pointer-events-none'}
                            ref={clipboardComment.target}
                            value={getRecommendedComment()}
                            readOnly
                        />
                    </div>
                </div>
            )}
        </div>
    );
};