import React from "react";
import {useShowCoins} from "@/shared/state/payroll/showCoins.ts";
import {EyeClosedIcon, EyeOpenIcon} from "@radix-ui/react-icons";
import {Toggle} from "@/components/ui/toggle.tsx";
import {useShowDayPrice} from "@/shared/state/payroll/showDayPrice.ts";
import {useShowEarnedDetail} from "@/shared/state/payroll/showEarnedDetail.ts";
import {useShowTotal} from "@/shared/state/payroll/showTotal.ts";
import {useHideSum} from "@/shared/state/payroll/hideSum.ts";

interface IProps {

}

export function CashNav(props: IProps) {
    const {} = props;

    const setShowCoins = useShowCoins(s => s.setShowCoins);
    const showCoins = useShowCoins(s => s.showCoins);

    const setShowDayPrice = useShowDayPrice(s => s.setShowDayPrice);
    const showDayPrice = useShowDayPrice(s => s.showDayPrice);

    const showEarnedDetail = useShowEarnedDetail(s => s.showEarnedDetail);
    const setShowEarnedDetail = useShowEarnedDetail(s => s.setShowEarnedDetail);

    const showTotal = useShowTotal(s => s.showTotal);
    const setShowTotal = useShowTotal(s => s.setShowTotal);

    const hideSum = useHideSum(s => s.hideSum);
    const setHideSum = useHideSum(s => s.setHideSum);

    return (
        <>
            <div className={'text-xs flex items-center gap-2'}>
                <span>Копейки: </span>

                <Toggle
                    className={'cursor-pointer noPrint bg-gray-800'}
                    pressed={showCoins}
                    onPressedChange={() => setShowCoins(!showCoins)}
                >
                    {showCoins ? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>
            </div>

            <div className={'text-xs flex items-center gap-2'}>
                <span>Ст-ть дня: </span>

                <Toggle
                    className={'cursor-pointer noPrint bg-gray-800'}
                    pressed={showDayPrice}
                    onPressedChange={() => setShowDayPrice(!showDayPrice)}
                >
                    {showDayPrice ? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>
            </div>


            <div className={'text-xs flex items-center gap-2'}>
                <span>Детали ЭЛО: </span>

                <Toggle
                    className={'cursor-pointer noPrint bg-gray-800'}
                    pressed={showEarnedDetail}
                    onPressedChange={() => setShowEarnedDetail(!showEarnedDetail)}
                >
                    {showEarnedDetail ? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>
            </div>

            <div className={'text-xs flex items-center gap-2'}>
                <span>Итоги: </span>

                <Toggle
                    className={'cursor-pointer noPrint bg-gray-800'}
                    pressed={showTotal}
                    onPressedChange={() => setShowTotal(!showTotal)}
                >
                    {showTotal ? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>
            </div>

            <div className={'text-xs flex items-center gap-2'}>
                <span>Выдача: </span>

                <Toggle
                    className={'cursor-pointer noPrint bg-gray-800'}
                    pressed={hideSum}
                    onPressedChange={() => setHideSum(!hideSum)}
                >
                    {hideSum ? (
                        <EyeOpenIcon className={'text-red-800'}/>
                    ) : (
                        <EyeClosedIcon className={'text-green-800'}/>
                    )}
                </Toggle>
            </div>
        </>
    );
}