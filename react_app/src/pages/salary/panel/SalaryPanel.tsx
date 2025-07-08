import {Btn} from "@/shared/ui/Buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";

interface SalaryPanelProps {
    setSelectedUserId: (arg: null) => void;
    selectedUserId: number | null;
}

export const SalaryPanel = (props: SalaryPanelProps) => {
    const {setSelectedUserId, selectedUserId} = props;


    return (
        <div className={twMerge([
            'flex items-center gap-2 p-1 px-2 bg-blue-100 min-w-full',
            'border border-gray-400 text-nowrap'
        ])}>
            <div>
                <Btn
                    className={'h-full'}
                    disabled={!selectedUserId}
                    onClick={() => setSelectedUserId(null)}
                >
                    В ведомость
                </Btn>
            </div>
            <div className={'flex items-center gap-2 min-w-0'}>
                <div className={'hidden md:block'}>
                    Недели:
                </div>
                <div className={twMerge([
                    'flex text-sm',
                    'overflow-x-auto'
                ])}>
                    <Btn className={'text-sm text-black py-0 bg-yellow-200 px-2 border border-gray-400'}>
                        Неделя 27
                        <br/>
                        07.07-13.07
                    </Btn>
                    <div className={'text-sm bg-yellow-100 px-2 border border-gray-400'}>
                        Неделя 26
                        <br/>
                        30.06-06.07
                    </div>
                    <div className={'text-sm bg-green-200 px-2 border border-gray-400'}>
                        Неделя 25
                        <br/>
                        23.06-29.06
                    </div>
                    <div className={'text-sm bg-green-200 px-2 border border-gray-400'}>
                        Неделя 24
                        <br/>
                        23.06-29.06
                    </div>
                    <div className={'text-sm bg-green-200 px-2 border border-gray-400'}>
                        Неделя 23
                        <br/>
                        23.06-29.06
                    </div>
                    <div className={'text-sm bg-green-200 px-2 border border-gray-400'}>
                        Неделя 22
                        <br/>
                        23.06-29.06
                    </div>
                    <div className={'text-sm bg-green-200 px-2 border border-gray-400'}>
                        Неделя 21
                        <br/>
                        23.06-29.06
                    </div>

                    <div className={'flex flex-col items-center bg-blue-200 px-2'}>
                        <span>Далее</span>
                        <span>{"=>"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};