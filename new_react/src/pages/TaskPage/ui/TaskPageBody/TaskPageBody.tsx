import {useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import cls from "../TaskPage.module.scss";

import {getNoRelevantId} from "../../model/selectors";
import {getTaskCard} from "../../model/api/getTaskCard";

import {AwaitSection} from "../Sections/AwaitSection";
import {Weeks} from "../Sections/Weeks";
import {InWorkSection} from "../Sections/InWorkSection";
import {ReadySection} from "../Sections/ReadySection";
import {useResizableBlocks, useWindowDimensions} from "@pages/EqPage";


export const TaskPageBody = () => {
    const {queryParameters} = useQueryParams();
    const noRelevantId = useAppSelector(getNoRelevantId);
    const dispatch = useAppDispatch();

    const {windowWidth, windowHeight} = useWindowDimensions(-45);
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
        y: -62,
    });

    useEffect(() => {
        if (noRelevantId && noRelevantId?.length > 0) {
            dispatch(getTaskCard({
                id: noRelevantId[0],
                ...queryParameters,
            }));
        }
    }, [dispatch, noRelevantId, queryParameters]);

    return (
        <div
            className={'d-flex'}
            style={{
                background: 'var(--bs-gray-300)',
                height: `${windowHeight}px`
            }}
        >
            <div className={cls.leftBlock} style={{width: `${leftBlockWidth}px`}}>
                <div
                    className={'d-flex justify-content-end'}
                    style={{
                        height: `${inWorkHeight}px`,
                        overflowX: "hidden",
                        overflowY: "auto",
                    }}>
                    <InWorkSection/>
                </div>

                <div className={'d-flex justify-content-end'} style={{width: `${leftBlockWidth}px`}}>
                    <Weeks blockWidthPx={leftBlockWidth} drag={drag} isDragging={isDragging} resetSize={resetSize}/>
                </div>

                <div style={{height: `${readyHeight}px`}} className={'d-flex justify-content-end'}>
                    <ReadySection/>
                </div>
            </div>

            <div className={cls.rightBlock} style={{width: `${rightBlockWidth}px`}}>
                <AwaitSection/>
            </div>

        </div>
    );
};
