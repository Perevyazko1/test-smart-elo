import {useContext, useEffect} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {useResizableBlocks, useWindowDimensions} from "@pages/EqPage";

import cls from "../TaskPage.module.scss";

import {getNoRelevantId} from "../../model/selectors";
import {getTaskCard} from "../../model/api/getTaskCard";

import {AwaitSection} from "../Sections/AwaitSection";
import {Weeks} from "../Sections/Weeks";
import {InWorkSection} from "../Sections/InWorkSection";
import {ReadySection} from "../Sections/ReadySection";
import {IsDesktopContext} from "@app";


export const TaskPageBody = (props: { setShowNavbar: () => void }) => {
    const {queryParameters} = useQueryParams();
    const noRelevantId = useAppSelector(getNoRelevantId);
    const isDesktop = useContext(IsDesktopContext);
    const dispatch = useAppDispatch();

    const {windowWidth, windowHeight} = useWindowDimensions(isDesktop ? -45 : 0);
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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            resetSize();
        }, 200);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [resetSize, windowWidth, windowHeight]);


    useEffect(() => {
        if (noRelevantId && noRelevantId?.length > 0) {
            dispatch(getTaskCard({
                id: noRelevantId[0],
                ...queryParameters,
            }));
        }
    }, [dispatch, noRelevantId, queryParameters]);

    return (

        <div className={'d-flex justify-content-center'} style={{
            background: "var(--bs-gray-300)",
            overflow: 'hidden',
        }}>
            <div
                className={'d-flex'}
                style={{
                    height: `${windowHeight}px`,
                    width: `${windowWidth}px`,
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
                        <Weeks
                            setShowNavbar={props.setShowNavbar}
                            blockWidthPx={leftBlockWidth}
                            drag={drag}
                            isDragging={isDragging}
                            resetSize={resetSize}
                        />
                    </div>

                    <div style={{height: `${readyHeight}px`}} className={'d-flex justify-content-end'}>
                        <ReadySection/>
                    </div>
                </div>

                <div className={cls.rightBlock} style={{width: `${rightBlockWidth}px`}}>
                    <AwaitSection/>
                </div>

            </div>
        </div>
    );
};
