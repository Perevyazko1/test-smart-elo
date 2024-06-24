import {ModalProvider} from "@app";
import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {taskPageReducer} from "../model/slice";

import {TaskPageBody} from "./TaskPageBody/TaskPageBody";
import {TaskPageNav} from "@pages/TaskPage/ui/TaskPageNav/TaskPageNav";


const initialReducers: ReducersList = {
    taskPage: taskPageReducer,
}


export const TaskPage = () => {

    return (
        <DynamicComponent reducers={initialReducers}>
            <ModalProvider>
                <QueryContext>
                    <TaskPageNav/>

                    <TaskPageBody/>
                </QueryContext>
            </ModalProvider>
        </DynamicComponent>
    );
};
