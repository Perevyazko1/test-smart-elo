import React, {memo, useEffect, useState} from "react";
import {EqInWorkSection} from "@pages/EqPage/ui/EqSections/EqInWorkSection";
import {useDraggable} from "@shared/hooks";
import {EqReadySection} from "@pages/EqPage/ui/EqSections/EqReadySection";
import {EqAwaitSection} from "@pages/EqPage/ui/EqSections/EqAwaitSection";

export const TestBody = memo(() => {
    const nawHeight = 45;
    const elementWidth = 100;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - nawHeight;

    interface Block {
        width: number;
        height: number;
    }

    const [awaitBlock, setAwaitBlock] = useState<Block>({
        width: windowWidth / 2,
        height: windowHeight - nawHeight,
    });

    const [inWorkBlock, setInWorkBlock] = useState<Block>({
        width: windowWidth / 2,
        height: (windowHeight - nawHeight) / 2,
    });

    const [readyBlock, setReadyBlock] = useState<Block>({
        width: windowWidth / 2,
        height: windowHeight / 2,
    });

    const {ref, elementCoord} = useDraggable({
        x: windowWidth / 2 - elementWidth / 2,
        y: windowHeight / 2,
    });

    useEffect(() => {
        setAwaitBlock({
            width: windowWidth - elementCoord.x - elementWidth / 2,
            height: windowHeight,
        })
        setInWorkBlock({
            width: elementCoord.x + elementWidth / 2,
            height: elementCoord.y,
        })
        setReadyBlock({
            width: elementCoord.x + elementWidth / 2,
            height: windowHeight - elementCoord.y,
        })
    }, [elementCoord, windowHeight, windowWidth]);


    return (
        <div className={'appBody'} style={{position: 'relative'}}>
            <div className={'d-flex'}>
                <div>
                    <div
                        style={{
                            width: `${inWorkBlock.width}px`,
                            height: `${inWorkBlock.height}px`
                        }}
                    >
                        <EqInWorkSection height={inWorkBlock.height}/>
                    </div>
                    <div className={'bg-success'}
                         style={{
                             width: `${readyBlock.width}px`,
                             height: `${readyBlock.height}px`
                         }}
                    >
                        <EqReadySection height={readyBlock.height}/>
                    </div>
                </div>
                <div>
                    <div className={'bg-info'}
                         style={{
                             width: `${awaitBlock.width}px`,
                             height: `${awaitBlock.height}px`
                         }}
                    >
                        <EqAwaitSection height={awaitBlock.height}/>
                    </div>
                </div>

            </div>

            <div
                style={{
                    width: `${elementWidth}px`,
                    height: '100px',
                    backgroundColor: 'blue',
                    position: 'absolute',
                    cursor: 'pointer',
                    left: `${elementCoord.x}px`,
                    top: `${elementCoord.y - nawHeight}px`,
                }}
                ref={ref}
            >
                Drag me
            </div>
        </div>
    );
});
