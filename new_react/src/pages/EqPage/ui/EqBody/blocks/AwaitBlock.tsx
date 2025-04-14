import {BlockName, EqCardList} from "@widgets/EqCardList";
import React, {useMemo} from "react";

interface AwaitBlockProps {
    expanded: boolean;
    inWorkHeight: number;
    readyHeight: number;
    windowHeight: number;
    leftBlockWidth: number;
    rightBlockWidth: number;
    filtersReady: boolean;
    depsAwait: boolean[];
    noRelevantIds: number[];
}

export const AwaitBlock = (props: AwaitBlockProps) => {
    const {
        expanded,
        readyHeight,
        inWorkHeight,
        windowHeight,
        leftBlockWidth,
        rightBlockWidth,
        filtersReady,
        depsAwait,
        noRelevantIds
    } = props;

    const awaitStyle = useMemo((): React.CSSProperties | undefined => {
        return {
            position: 'absolute',
            top: expanded ? inWorkHeight + 36 : 0,
            height: expanded ? readyHeight : windowHeight,
            left: leftBlockWidth,
            width: rightBlockWidth,
            maxWidth: "1200px",
            overflowX: 'hidden',
            overflowY: 'auto',
        }
    }, [expanded, inWorkHeight, readyHeight, windowHeight, leftBlockWidth, rightBlockWidth]);

    return (
        <div style={awaitStyle}>
            <EqCardList
                listType={'await'}
                expanded={expanded}
                inited={filtersReady || false}
                deps={depsAwait}
                noRelevantIds={noRelevantIds}
            />

            <BlockName
                listType={'await'}
            />
        </div>
    )
}