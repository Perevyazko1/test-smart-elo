import {useForm} from "react-hook-form";
import type {IEarning, IEarningType} from "@/entities/salary";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import type {FormEvent} from "react";

interface CreateEarningFormProps {
    onSubmit?: (data: IEarning) => void;
    userId: number | null;
    createdById: number;
    earning_type: IEarningType;
    disabled?: boolean;
    week: IWeek;
    about?: string;
}

export const CreateEarningForm = (props: CreateEarningFormProps) => {
    const {onSubmit, week, about, disabled = true, earning_type, userId, createdById} = props;

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<IEarning>({
        defaultValues: {
            user: userId,
            created_by: createdById,
            target_date: week.date_from,
            earning_type: earning_type,
            comment: about
        }
    });

    const onSubmitHandler = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            handleSubmit(onSubmit)(e);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor={"amount"}>
                    Сумма
                </label>
                <input
                    id={"amount"}
                    disabled={disabled}
                    className={'bg-white p-2 w-full'}
                    type="number"
                    {...register("amount", {
                        required: "Укажите сумму",
                        min: {value: 1, message: "Сумма не может быть отрицательной или нулем"}
                    })}
                    placeholder="Amount"
                />
                {errors.amount && (
                    <span className="text-red-500">{errors.amount.message}</span>
                )}
            </div>

            <div className="space-y-2">
                <TextArea
                    disabled={disabled}
                    className={'bg-white p-2 w-full'}
                    {...register("comment", {
                        required: "Указание описание"
                    })}
                    placeholder="Комментарий"
                />
                {errors.comment && (
                    <span className="text-red-500">{errors.comment.message}</span>
                )}
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
                    {...register("target_date", {required: "Дата закрепления обязательна"})}
                />
                {errors.target_date && (
                    <span className="text-red-500">{errors.target_date.message}</span>
                )}
            </div>

            <Btn
                className={'px-8 py-2 bg-black text-white'}
                disabled={disabled}
                type="submit"
            >
                Создать
            </Btn>
        </form>
    );
};