import {ModalProvider} from "@app";

import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {eqPageReducer} from "../model/slice/eqPageSlice";

import {EqNav} from "./EqNav/EqNav";
import {EqBody} from "./EqBody/EqBody";
import {Container} from "react-bootstrap";

// Список редьюсеров для инициализации
const initialReducers: ReducersList = {
    eqPage: eqPageReducer,
}

export const EqPage = () => {

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            {/*Подключаем динамическую подгрузку редьюсера*/}

            {/*Оборачиваем контент в контекст для использования query параметров*/}
            <QueryContext>
                <ModalProvider>
                    <EqNav/>

                    <EqBody/>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
