import useWindowDimensions from "shared/lib/hooks/useWindowDimensions/useWindowDimensions";
import useResizableBlocks from "shared/lib/hooks/useResizableBlocks/useResizableBlocks";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {eqContentDesktopReducer} from "../../../../model/slice/eqContentDesktopSlice";
import {EqWeekBlock} from "../EqWeekBlock/EqWeekBlock";
import cls from "./EqDesktopContent.module.scss";
import {EqCardSection} from "../EqCardSection/EqCardSection";

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
        drag
    } = useResizableBlocks(windowWidth, windowHeight);


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

                    <EqWeekBlock drag={drag} isDragging={isDragging}/>

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