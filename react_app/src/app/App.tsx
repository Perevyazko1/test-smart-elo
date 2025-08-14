import React from "react";
import {Outlet} from "react-router-dom";

import {Navbar} from "@/widgets/navbar/Navbar.tsx";
import {useShowCoins} from "@/shared/state/payroll/showCoins.ts";
import {EyeClosedIcon, EyeOpenIcon} from "@radix-ui/react-icons";
import {Toggle} from "@/components/ui/toggle.tsx";


export const App = () => {
    const setShowCoins = useShowCoins(s => s.setShowCoins);
    const showCoins = useShowCoins(s => s.showCoins);
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
