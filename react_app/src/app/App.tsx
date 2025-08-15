import React from "react";
import {Outlet} from "react-router-dom";

import {Navbar} from "@/widgets/navbar/Navbar.tsx";
import {useShowCoins} from "@/shared/state/payroll/showCoins.ts";
import {EyeClosedIcon, EyeOpenIcon} from "@radix-ui/react-icons";
import {Toggle} from "@/components/ui/toggle.tsx";
import {useShowDayPrice} from "@/shared/state/payroll/showDayPrice.ts";
import {useShowEarnedDetail} from "@/shared/state/payroll/showEarnedDetail.ts";
import {useShowTotal} from "@/shared/state/payroll/showTotal.ts";


export const App = () => {
    const setShowCoins = useShowCoins(s => s.setShowCoins);
    const showCoins = useShowCoins(s => s.showCoins);

    const setShowDayPrice = useShowDayPrice(s => s.setShowDayPrice);
    const showDayPrice = useShowDayPrice(s => s.showDayPrice);

    const showEarnedDetail = useShowEarnedDetail(s => s.showEarnedDetail);
    const setShowEarnedDetail = useShowEarnedDetail(s => s.setShowEarnedDetail);

    const showTotal = useShowTotal(s => s.showTotal);
    const setShowTotal = useShowTotal(s => s.setShowTotal);

    return (
        <div className={'bg-gray-500 min-h-[100dvh] max-h-[100dvh] overflow-y-hidden'}>
            <Navbar>
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
            </Navbar>
            <div
                style={{
                    minHeight: 'calc(100dvh - 45px)',
                    maxHeight: 'calc(100dvh - 45px)',
                    height: 'calc(100dvh - 45px)',
                }}
                className={'relative overflow-y-auto'}>
                <Outlet/>
            </div>
        </div>
    )
}
