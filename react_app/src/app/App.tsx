import React, {type ReactNode} from "react";
import {Outlet} from "react-router-dom";

import {Navbar} from "@/widgets/navbar/Navbar.tsx";


interface IProps {
    nav?: ReactNode;
}


export const App = (props: IProps) => {
    return (
        <div className={'bg-gray-500 relative'}>
            <Navbar>
                {props.nav}
            </Navbar>
            <div
                className={'relative'}>
                <Outlet/>
            </div>
        </div>
    )
}
