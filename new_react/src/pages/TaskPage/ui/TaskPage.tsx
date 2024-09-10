import {useState} from "react";

import {ModalProvider} from "@app";

import {QueryContext} from "@features";

import {TaskPageBody} from "./TaskPageBody/TaskPageBody";
import {TaskPageNav} from "./TaskPageNav/TaskPageNav";


export const TaskPage = () => {
    const [showNavbar, setShowNavbar] = useState(false);

    return (
        <ModalProvider>
            <QueryContext>
                <TaskPageNav closeClb={() => setShowNavbar(false)} showNav={showNavbar}/>

                <TaskPageBody setShowNavbar={() => setShowNavbar(true)}/>
            </QueryContext>
        </ModalProvider>
    );
};
