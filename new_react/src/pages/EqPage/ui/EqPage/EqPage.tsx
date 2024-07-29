import {useCallback, useState} from "react";

import {ModalProvider} from "@app";

import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {eqPageReducer} from "../../model/slice/eqPageSlice";

import {EqNav} from "../EqNav/EqNav";
import {EqBody} from "../EqBody/EqBody";

// Список редьюсеров для инициализации
const initialReducers: ReducersList = {
    eqPage: eqPageReducer,
}

export const EqPage = () => {
    // Устанавливаем состояние отображения мобильной панели
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    // Устанавливаем коллбек для закрытия шторки меню для мобилок
    const closeClb = useCallback(() => {
        setShowCanvas(false)
    }, []);

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            {/*Подключаем динамическую подгрузку редьюсера*/}

            {/*Оборачиваем контент в контекст для использования query параметров*/}
            <QueryContext>
                <ModalProvider>
                    {/*Компонент навбара*/}
                    <EqNav closeClb={closeClb} showCanvas={showCanvas}/>

                    {/*Контент страницы*/}
                    <EqBody showClb={() => setShowCanvas(true)}/>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
