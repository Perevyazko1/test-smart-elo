import {EqSectionCard} from "@pages/EqPage/ui/EqBody/EqSectionCard";
import useResizableBlocks from "@pages/EqPage/model/lib/useResizableBlocks";
import React, {useContext} from "react";
import useWindowDimensions from "@pages/EqPage/model/lib/useWindowDimensions";
import {IsDesktopContext} from "@app";
import {EqWeeks} from "@pages/EqPage/ui/EqBody/EqWeeks";

interface EqBodyProps {
    showClb: () => void;
}

export const EqBody = (props: EqBodyProps) => {
    const {showClb} = props;

    const isDesktop = useContext(IsDesktopContext);
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
        x: 27,
        y: isDesktop ? -62 : -20,
    });


    return (

        <div className={'appBody bg-success'}>
            <div className={'d-flex'}
                 style={{
                     height: `${windowHeight}px`,
                     background: "var(--bs-gray-300)",
                 }}
            >
                <div style={{width: `${leftBlockWidth}px`}}>
                    <div style={{
                        width: `${leftBlockWidth}px`,
                        height: `${inWorkHeight}px`,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 0.15rem',
                    }}
                    >
                        <EqSectionCard height={inWorkHeight}   width={leftBlockWidth}/>
                    </div>


                    <EqWeeks isDragging={isDragging} showClb={showClb} drag={drag} resetSize={resetSize}
                             blockWidthPx={leftBlockWidth}
                    />

                    <div style={{
                        width: `${leftBlockWidth}px`,
                        height: `${readyHeight}px`,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 0.15rem',
                    }}
                    >
                        <EqSectionCard height={readyHeight}  width={leftBlockWidth}/>
                    </div>


                </div>

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
                    <EqSectionCard height={windowHeight} width={rightBlockWidth}/>
                </div>
            </div>
        </div>
    );
};
