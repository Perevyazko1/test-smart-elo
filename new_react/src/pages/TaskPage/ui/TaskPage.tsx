import {ModalProvider} from "@app";

import {QueryContext} from "@features";

import {TaskPageBody} from "./TaskPageBody/TaskPageBody";
import {TaskPageNav} from "./TaskPageNav/TaskPageNav";


export const TaskPage = () => {

    return (
        <ModalProvider>
            <QueryContext>
                <TaskPageNav/>

                <TaskPageBody/>
            </QueryContext>
        </ModalProvider>
    );
};
