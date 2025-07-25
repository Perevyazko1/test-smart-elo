import React from "react";
import {Outlet} from "react-router-dom";

import {Navbar} from "@/widgets/navbar/Navbar.tsx";


export const App = () => {


    return (
        <div className={'bg-gray-500 h-screen'}>
            <Navbar/>
            <div style={{height: 'calc(100dvh - 50px'}}>
                <Outlet/>
            </div>
        </div>
    )
}
