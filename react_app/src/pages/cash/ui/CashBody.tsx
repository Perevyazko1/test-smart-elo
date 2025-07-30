import {twMerge} from "tailwind-merge";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import type {IWeek} from "@/shared/utils/date.ts";
import {useQuery} from "@tanstack/react-query";
import {cashService} from "@/pages/cash/model/api.ts";
import {AddEarningBtn} from "@/widgets/cash/actions/AddEarningBtn.tsx";
import {DetailsTable} from "@/widgets/cash/details/DetailsTable.tsx";

interface CashBodyProps {
    weeks: IWeek[];
    currentWeek: IWeek;
    setCurrentWeek: (arg: IWeek) => void;
}

export const CashBody = (props: CashBodyProps) => {
    const {weeks, currentWeek, setCurrentWeek} = props;

    const {data, isFetching} = useQuery({
        queryKey: ['cashDetail', currentWeek.weekNumber],
        queryFn: () => {
            return cashService.getCashInfo({
                date_from: currentWeek.date_from,
                date_to: currentWeek.date_to,
            });
        },
        staleTime: Infinity
    });

    if (isFetching) {
        return (
            <div>Загрузка...</div>
        )
    }

    if (!data?.data) {
        return (
            <div>Ошибка загрузки</div>
        )
    }



    return (
        <>
            <div className={'min-h-full flex flex-col'}>
                <div className={'text-[36px] border-2 border-black p-8 pt-4'}>
                    <div>Остаток</div>
                    <div className={'flex justify-between gap-10'}>
                        <div>Наличные:</div>
                        <div>{(data.data.cash_balance).toLocaleString('ru-RU')}</div>
                    </div>
                    <div className={'flex justify-between gap-10'}>
                        <div>На картах:</div>
                        <div>{(data.data.card_balance).toLocaleString('ru-RU')}</div>
                    </div>
                </div>
                <div className={twMerge(
                    'flex-1 p-4 gap-4 flex flex-col text-nowrap',
                    'border-b-2 border-l-2 border-r-2 border-black'
                )}>
                    <div className={'flex gap-8 justify-between'}>
                        <AddEarningBtn
                            info={"Внести выдачу НАЛ"}
                            earning_type={'Выдача НАЛ'}
                            user={null}
                            disabled={isFetching}
                            week={currentWeek}
                        >
                            <Btn
                                className={'bg-yellow-100 border-yellow-700 border-2 flex-1'}
                            >
                                <div>ВЫДАТЬ</div>
                                <div>(РАСХОД НАЛ)</div>
                            </Btn>
                        </AddEarningBtn>

                        <Btn
                            className={'bg-gray-200 border-gray-700 border-2 flex-1'}
                        >
                            <div>ВЫДАТЬ</div>
                            <div>(БН И КАРТА)</div>
                        </Btn>
                    </div>

                    <div className={'flex gap-8 justify-between'}>
                        <AddEarningBtn
                            info={"Внести внесение НАЛ"}
                            earning_type={'Внесение НАЛ'}
                            user={null}
                            disabled={isFetching}
                            week={currentWeek}
                        >
                            <Btn
                                className={'bg-green-100 border-green-700 border-2 flex-1'}
                            >
                                <div>ВНЕСТИ</div>
                                <div>(БАНКОМАТ)</div>
                            </Btn>
                        </AddEarningBtn>


                        <Btn
                            className={'bg-gray-200 border-gray-700 border-2 flex-1'}
                        >
                            <div>ВНЕСТИ</div>
                            <div>(БН И КАРТА)</div>
                        </Btn>
                    </div>
                </div>
            </div>
            <div className={'min-h-full flex flex-col flex-1'}>
                <div className={twMerge(
                    'flex gap-2 p-2',
                    'border-t-2 border-black border-b-2 border-r-2',
                )}>
                    {weeks.map((week) => (
                        <Btn
                            onClick={() => setCurrentWeek(week)}
                            className={twMerge(
                                'text-nowrap',
                                currentWeek?.weekNumber === week.weekNumber ? 'bg-yellow-200' : 'bg-blue-200'
                            )}
                            key={week.weekNumber}
                        >
                            <div>НЕД: {week.weekNumber}</div>
                            <div className={'text-xs'}>
                                {week.dateRangeStr}
                            </div>
                        </Btn>
                    ))}
                </div>
                <div className={'flex-1 border-black border-b-2 border-r-2 overflow-auto'}>
                    <DetailsTable
                        week={currentWeek}
                        earnings={data.data.earnings}
                        start_balance={data.data.start_balance}
                    />
                </div>
            </div>
        </>
    );
};