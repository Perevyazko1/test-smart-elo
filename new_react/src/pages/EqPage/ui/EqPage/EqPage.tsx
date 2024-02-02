import {useCallback, useEffect, useState} from "react";

import {DynamicComponent, QueryContext, ReducersList} from "@features";
import {useAppIsLoading, useAppSelector} from "@shared/hooks";

import {EqNav} from "../EqNav/EqNav";
import {EqBody} from "../EqBody/EqBody";
import {eqPageReducer} from "../../model/slice/eqPageSlice";
import {getAwaitListInfo, getInWorkListInfo, getReadyListInfo} from "../../model/selectors/cardSelectors";
import {getEqProjects, getEqViewMode, getWeekData} from "../../model/selectors/filterSelectors";
import {ModalProvider} from "@app";

// Список редьюсеров для инициализации
const initialReducers: ReducersList = {
    eqPage: eqPageReducer,
}

export const EqPage = () => {
    // Устанавливаем состояние отображения мобильной панели
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    // Поднимаем контекст загрузки приложения
    const {isLoading, setIsLoading} = useAppIsLoading();

    // Считываем свойства всех списков
    const awaitProps = useAppSelector(getAwaitListInfo);
    const inWorkProps = useAppSelector(getInWorkListInfo);
    const readyProps = useAppSelector(getReadyListInfo);
    const weekProps = useAppSelector(getWeekData);
    const modeProps = useAppSelector(getEqViewMode);
    const projectProps = useAppSelector(getEqProjects);

    // Устанавливаем функцию проверки загрузки общей
    const getLoadingState = useCallback(() => {
        return awaitProps.isLoading ||
            inWorkProps.isLoading ||
            readyProps.isLoading ||
            weekProps?.isLoading ||
            modeProps?.isLoading ||
            projectProps?.isLoading ||
            false
    }, [awaitProps.isLoading, inWorkProps.isLoading, modeProps?.isLoading, projectProps?.isLoading, readyProps.isLoading, weekProps?.isLoading])

    // Отслеживаем изменение состояния загрузки и устанавливаем в хук индикатора загрузки
    useEffect(() => {
        if (isLoading !== getLoadingState()) {
            setIsLoading(getLoadingState());
        }
    }, [isLoading, getLoadingState, setIsLoading]);

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
