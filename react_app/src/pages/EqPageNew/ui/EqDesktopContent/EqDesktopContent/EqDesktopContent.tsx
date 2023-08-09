import {useEffect} from "react";
import {useSelector} from "react-redux";

import useWindowDimensions from "shared/lib/hooks/useWindowDimensions/useWindowDimensions";
import useResizableBlocks from "shared/lib/hooks/useResizableBlocks/useResizableBlocks";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {EqWeekBlock} from "../EqWeekBlock/EqWeekBlock";
import {EqCardSection} from "../EqCardSection/EqCardSection";
import {eqContentDesktopReducer} from "../../../model/slice/eqContentDesktopSlice";
import {fetchEqUpdateCard} from "../../../model/service/fetchEqUpdateCard";
import {getNoRelevantId} from "../../../model/selectors/filtersSelectors/filtersSelectors";

import cls from "./EqDesktopContent.module.scss";

const initialReducers: ReducersList = {
    eqDesktop: eqContentDesktopReducer,
}


const EqDesktopContent = () => {
    const {windowWidth, windowHeight} = useWindowDimensions(-57);
    const {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        resetSize,
        drag
    } = useResizableBlocks(windowWidth, windowHeight);

    const dispatch = useAppDispatch();
    const noRelevantId = useSelector(getNoRelevantId);
    
    useEffect(() => {
        if (noRelevantId.length > 0) {
            dispatch(fetchEqUpdateCard({
                mode: 'GET',
                series_id: noRelevantId[0],
                variant: 'desktop',
            }))
        }
    }, [dispatch, noRelevantId])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <div className={'d-flex'}>
                <div
                    style={{
                        width: `${leftBlockWidth}px`,
                        height: `${windowHeight}`
                    }}
                >
                    <EqCardSection
                        listType={'in_work'}
                        widthPx={leftBlockWidth}
                        heightPx={inWorkHeight}
                        cls={cls.inWorkBlock}
                    />

                    <EqWeekBlock drag={drag} isDragging={isDragging} onDoubleClick={resetSize}/>

                    <EqCardSection
                        listType={'ready'}
                        widthPx={leftBlockWidth}
                        heightPx={readyHeight}
                        cls={cls.readyBlock}
                    />

                </div>

                <EqCardSection
                    cls={cls.awaitBlock}
                    heightPx={windowHeight}
                    widthPx={rightBlockWidth}
                    listType={'await'}
                />
            </div>
        </DynamicModuleLoader>
    );
};

export default EqDesktopContent;