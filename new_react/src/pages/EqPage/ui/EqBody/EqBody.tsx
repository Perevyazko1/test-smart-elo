import useResizableBlocks from "@pages/EqPage/model/lib/useResizableBlocks";
import React, {useContext, useEffect} from "react";
import useWindowDimensions from "@pages/EqPage/model/lib/useWindowDimensions";
import {IsDesktopContext} from "@app";
import {EqWeeks} from "@pages/EqPage/ui/EqBody/EqWeeks";
import {useAppDispatch, useAppQuery, useAppSelector} from "@shared/hooks";
import {getNoRelevantId} from "@pages/EqPage/model/selectors/cardSelectors";
import {fetchEqUpdCard} from "@pages/EqPage/model/api/fetchEqUpdCard";
import {EqAwaitSection} from "@pages/EqPage/ui/EqSections/EqAwaitSection";
import {EqInWorkSection} from "@pages/EqPage/ui/EqSections/EqInWorkSection";
import {EqReadySection} from "@pages/EqPage/ui/EqSections/EqReadySection";

interface EqBodyProps {
    showClb: () => void;
}

export const EqBody = (props: EqBodyProps) => {
    // Достаем из пропсов коллбек который далее передадим в блок недель на кнопку открытия канваса меню
    const {showClb} = props;

    // Вызываем хук query параметров
    const {queryParameters} = useAppQuery();
    const dispatch = useAppDispatch();

    // Поднимаем проверку устройства
    const isDesktop = useContext(IsDesktopContext);

    // Поднимаем отслеживатель изменения размеров окна и инициализируем исходные параметры. Учитываем что на
    // мобилках не отображается сверху навбар размером 45px
    const {windowWidth, windowHeight} = useWindowDimensions(isDesktop ? -45 : 0);

    // Вызываем хук для масштабирования блоков ЭЛО
    const {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        resetSize,
        drag
    } = useResizableBlocks(windowWidth, windowHeight, {
        // Устанавливаем смещение относительно кнопки которая будет drag элементом (подобрано в ручную)
        x: 27,
        // Для мобилок смещение устанавливается с учетом того, что не будет навбара сверху
        y: isDesktop ? -62 : -20,
    });

    // Читаем ID карточек которые нужно обновит
    const noRelevantId = useAppSelector(getNoRelevantId);

    // Поочередно запрашиваем обновленные данные по ID пока список не будет пуст. Список чистится внутри редьюсера.
    useEffect(() => {
        if (noRelevantId && noRelevantId.length > 0) {
            dispatch(fetchEqUpdCard({
                mode: 'GET',
                series_id: noRelevantId[0],
                variant: 'desktop',
                ...queryParameters,
            }))
        }
        // eslint-disable-next-line
    }, [dispatch, noRelevantId])


    return (
        <div className={'appBody'}>
            <div className={'d-flex'}
                 style={{
                     height: `${windowHeight}px`,
                     background: "var(--bs-gray-300)",
                 }}
            >
                {/* Блок в работе */}
                <div style={{width: `${leftBlockWidth}px`}}>
                    <div style={{
                        width: `${leftBlockWidth}px`,
                        height: `${inWorkHeight}px`,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 0.15rem',
                    }}
                    >
                        <EqInWorkSection
                            height={inWorkHeight}
                        />
                    </div>


                    {/* Блок недель */}
                    <EqWeeks isDragging={isDragging} showClb={showClb} drag={drag} resetSize={resetSize}
                             blockWidthPx={leftBlockWidth}
                    />

                    {/* Блок готовых изделий */}
                    <div style={{
                        width: `${leftBlockWidth}px`,
                        height: `${readyHeight}px`,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 0.15rem',
                    }}
                    >
                        <EqReadySection
                            height={readyHeight}
                        />
                    </div>


                </div>

                {/* Блок изделий в работе */}
                <div
                    style={{
                        width: `${rightBlockWidth}px`,
                        height: `${windowHeight}px`,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        borderLeft: '3px solid #495057',
                        padding: '0 0 0 0.15rem',
                    }}
                >
                    <EqAwaitSection
                        height={windowHeight}
                    />
                </div>
            </div>
        </div>
    );
};
