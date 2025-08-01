import {type ChangeEvent, type FormEvent, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import type {ICreateEarning, IEarningType} from "@/entities/salary";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import type {IUser} from "@/entities/user";
import {useClipboard} from "use-clipboard-copy";
import {CopyIcon} from "lucide-react";
import {toast} from "sonner";
import {TextAreaForm} from "@/shared/ui/inputs/TextInputForm.tsx";
import {PriceInputForm} from "@/shared/ui/inputs/PriceInputForm.tsx";


interface CreateEarningFormProps {
    onSubmit?: (data: ICreateEarning) => void;
    user: IUser | null;
    createdById: number;
    earning_type: IEarningType;
    disabled?: boolean;
    week: IWeek;
    about?: string;
    amount?: number;
}


export const CreateEarningForm = (props: CreateEarningFormProps) => {
    const {onSubmit, amount, week, about, disabled = true, earning_type, user, createdById} = props;
    const clipboardAmount = useClipboard();
    const clipboardComment = useClipboard();


    const methods = useForm<ICreateEarning>({
        defaultValues: {
            amount: amount || undefined,
            user_id: user?.id || null,
            created_by: createdById,
            target_date: week.date_from,
            earning_type: earning_type,
            comment: about
        }
    });

    const [weekData, setWeekData] = useState({
        "ПН": 8,
        "ВТ": 8,
        "СР": 8,
        "ЧТ": 8,
        "ПТ": 8,
        "СБ": 0,
        "ВС": 0,
    })

    const onSubmitHandler = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            methods.handleSubmit(onSubmit)(e);
        }
    };

    const weekDataChangeHandle = (e: ChangeEvent<HTMLInputElement>, day: string) => {
        const newValue = Number(e.target.value);
        if (isNaN(newValue) || newValue < 0) {
            return
        }
        setWeekData({...weekData, [day]: newValue});
    }

    const totalHours = Math.ceil(Object.values(weekData).reduce((sum, hours) => sum + hours, 0) * 100) / 100;
    const totalAmount = Math.ceil(totalHours * (user?.piecework_amount || 0));

    const getRecommendedComment = () => {
        const daysStr = Object.entries(weekData)
            .map(([day, hours]) => `${day}:${hours}`)
            .join(', ');
        return `Начисление ЗП нед ${week.weekNumber} - ${totalHours} часов (${daysStr})`;
    }

    const copyAmountHandle = () => {
        clipboardAmount.copy();
        toast.success("Сумма скопирована");
    }

    const copyCommentHandle = () => {
        clipboardComment.copy();
        toast.success("Комментарий скопирован");
    }


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
                        {/*<input*/}
                        {/*    disabled={disabled}*/}
                        {/*    className={'bg-white p-2 w-full'}*/}
                        {/*    type="number"*/}
                        {/*    step="0.01"*/}
                        {/*    onInput={(e) => {*/}
                        {/*        const value = e.currentTarget.value;*/}
                        {/*        if (value.includes('.') && value.split('.')[1].length > 2) {*/}
                        {/*            e.currentTarget.value = Number(value).toFixed(2);*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    {...register("amount", {*/}
                        {/*        required: "Укажите сумму",*/}
                        {/*        min: {value: 1, message: "Сумма не может быть отрицательной или нулем"}*/}
                        {/*    })}*/}
                        {/*    placeholder="Amount"*/}
                        {/*/>*/}
                        {/*{errors.amount && (*/}
                        {/*    <span className="text-red-500">{errors.amount.message}</span>*/}
                        {/*)}*/}
                    </div>

                    <div className="space-y-2">
                        <TextAreaForm
                            placeholder="Комментарий"
                            required
                            disabled={disabled}
                            className={'bg-white p-2 w-full min-w-[30em]'}
                            name={'comment'}
                        />
                        {/*<TextArea*/}
                        {/*    disabled={disabled}*/}
                        {/*    className={'bg-white p-2 w-full min-w-[30em]'}*/}
                        {/*    {...register("comment", {*/}
                        {/*        required: "Указание описание"*/}
                        {/*    })}*/}
                        {/*    placeholder="Комментарий"*/}
                        {/*/>*/}
                        {/*{errors.comment && (*/}
                        {/*    <span className="text-red-500">{errors.comment.message}</span>*/}
                        {/*)}*/}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor={"target_date"}>
                            Дата закрепления
                        </label>
                        <br/>
                        <input
                            id={"target_date"}
                            disabled={disabled}
                            className={'bg-white p-2'}
                            type="date"
                            {...methods.register("target_date", {required: "Дата закрепления обязательна"})}
                        />
                        {/*{errors.target_date && (*/}
                        {/*    <span className="text-red-500">{errors.target_date.message}</span>*/}
                        {/*)}*/}
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
                                    className={'p-2 w-16 text-end bg-yellow-50 disabled:bg-transparent'}
                                    value={value}
                                    type="number"
                                    onChange={(e) => weekDataChangeHandle(e, day)}
                                />
                            </div>
                        ))}
                    </div>
                    <hr/>
                    <div>
                        Часов: <b>{totalHours}</b> Ставка: <b>{user?.piecework_amount || 0}</b>
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