import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {taskPageReducer} from "../model/slice";

import {TaskPageBody} from "./TaskPageBody/TaskPageBody";
import {TaskPageNav} from "@pages/TaskPage/ui/TaskPageNav/TaskPageNav";
import {useState} from "react";


const initialReducers: ReducersList = {
    taskPage: taskPageReducer,
}


export const TaskPage = () => {
    const [showNavbar, setShowNavbar] = useState(false);

    return (
        <DynamicComponent reducers={initialReducers}>
            <ModalProvider>
                <QueryContext>
                    <TaskPageNav closeClb={() => setShowNavbar(false)} showNav={showNavbar}/>

                    <TaskPageBody setShowNavbar={() => setShowNavbar(true)}/>
                </QueryContext>
            </ModalProvider>
        </DynamicComponent>
    );
};
