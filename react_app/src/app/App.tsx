import React from "react";
import {Outlet} from "react-router-dom";

import {Navbar} from "@/widgets/navbar/Navbar.tsx";


export const App = () => {


    return (
        <div className={'bg-gray-500 min-h-screen'}>
            <Navbar/>
            <Outlet/>
        </div>
    )
}
