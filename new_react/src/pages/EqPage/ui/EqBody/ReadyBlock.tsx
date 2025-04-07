import {BlockName, EqCardList} from "@widgets/EqCardList";
import React, {useMemo} from "react";

interface ReadyBlockProps {
    expanded: boolean;
    filtersReady: boolean;
    deps: boolean[];
    noRelevantIds: number[];
    inWorkHeight: number;
    rightBlockWidth: number;
    leftBlockWidth: number;
    readyHeight: number;
}

export const ReadyBlock = (props: ReadyBlockProps) => {
    const {
        expanded,
        filtersReady,
        noRelevantIds,
        deps,
        readyHeight,
        rightBlockWidth,
        leftBlockWidth,
        inWorkHeight
    } = props;
    const readyStyle = useMemo((): React.CSSProperties | undefined => {
        return {
            position: 'absolute',
            top: inWorkHeight + 36,
            right: rightBlockWidth,
            width: leftBlockWidth,
            maxWidth: "1200px",
            height: readyHeight,
            overflowX: 'hidden',
            overflowY: 'auto',
        }
    }, [inWorkHeight, leftBlockWidth, readyHeight, rightBlockWidth]);

    return (

        <div style={readyStyle}>
            <EqCardList
                listType={'ready'}
                expanded={expanded}
                inited={filtersReady || false}
                deps={deps}
                noRelevantIds={noRelevantIds}
            />
            <BlockName
                listType={'ready'}
            />
        </div>
    )
}