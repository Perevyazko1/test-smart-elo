import React, {memo, useMemo} from 'react';
import {BlockName, EqCardList} from "@widgets/EqCardList";

interface InWorkBlockProps {
    expanded: boolean;
    leftBlockWidth: number;
    rightBlockWidth: number;
    inWorkHeight: number;
    filtersReady: boolean;
    depsInWork: boolean[];
    noRelevantIds: number[];
}


export const InWorkBlock = memo((props: InWorkBlockProps) => {
    const {
        expanded,
        rightBlockWidth,
        leftBlockWidth,
        inWorkHeight,
        depsInWork,
        noRelevantIds,
        filtersReady
    } = props;

    const inWorkStyle = useMemo((): React.CSSProperties | undefined => {
        return {
            position: 'absolute',
            top: 0,
            ...(expanded ? {left: leftBlockWidth} : {right: rightBlockWidth}),
            width: expanded ? rightBlockWidth : leftBlockWidth,
            maxWidth: '1200px',
            height: inWorkHeight,
            overflowX: 'hidden',
            overflowY: 'auto',
        }
    }, [inWorkHeight, leftBlockWidth, rightBlockWidth, expanded]);

    return (
        <div style={inWorkStyle}>
            <EqCardList
                listType={'in_work'}
                expanded={expanded}
                inited={filtersReady || false}
                deps={depsInWork}
                noRelevantIds={noRelevantIds}
            />
            <BlockName
                listType={'in_work'}
            />
        </div>
    );
})