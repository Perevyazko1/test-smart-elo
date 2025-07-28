import {useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {earningService} from "@/widgets/salary/accrual/model/api.ts";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import {TrashIcon} from "lucide-react";

interface DeleteEarningBtnProps {
    earningId: number;
    amount: number;
}

export const DeleteEarningBtn = (props: DeleteEarningBtnProps) => {
    const {earningId, amount} = props;

    const client = useQueryClient();

    const deleteDetailRow = () => {
        toast.promise(
            earningService.deleteEarning({earning_id: earningId}),
            {
                loading: 'Удаление позиции',
                success: () => {
                    client.invalidateQueries({queryKey: ['cashDetail']})
                    toast.dismiss(`earning${earningId}`);
                    return 'Позиция удалена!';
                },
                error: () => {
                    return 'Ошибка удаления позиции. Проверьте доступность недели или обратитесь к администратору.'
                }
            }
        )
    }

    const deleteHandle = () => {
        toast(`Удалить позицию на ${amount}?`, {
            id: `earning${earningId}`,
            cancel:
                <Btn
                    className={'bg-black text-white'}
                    onClick={deleteDetailRow}
                >
                    Удалить
                </Btn>,
        });
    }

    return (
        <Btn
            onClick={deleteHandle}
            className={twMerge(
                'p-1 bg-black rounded-2xl border-1',
                'opacity-50 hover:opacity-100',
                'text-red-400 border-red-800',
            )}
        >
            <TrashIcon size={12}/>
        </Btn>
    );
};