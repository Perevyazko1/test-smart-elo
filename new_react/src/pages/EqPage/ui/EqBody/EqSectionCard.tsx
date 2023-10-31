import React, {CSSProperties, memo, useCallback, useContext} from "react";
import {FixedSizeGrid as Grid, FixedSizeList as List, ListChildComponentProps} from 'react-window';
import {AppInCompactMode} from "@app";

import {EqCard} from "../EqCard/EqCard";

const itemsCount = 2;

interface EqSectionCardProps {
    height: number;
    width: number;
}

export const EqSectionCard = memo((props: EqSectionCardProps) => {
    const {height, width} = props;

    const compactModeContext = useContext(AppInCompactMode);
    if (!compactModeContext) {
        throw new Error("SomeComponent must be used within a AppInCompactMode.Provider");
    }
    const {isCompactMode} = compactModeContext;

    const columns = Math.trunc(width / 800)

    const renderListItem = useCallback((props: ListChildComponentProps) => {
        const {isScrolling, index, ...otherProps} = props;

        return (
            <EqCard {...otherProps}/>
        );
    }, []);

    const Cell = useCallback((props: { columnIndex: number, rowIndex: number, style: CSSProperties }) => {
        return (
            <EqCard style={props.style}/>
        );
    }, []);


    return (
        <div style={{width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
            {width < 1400 ?
                <List itemSize={isCompactMode ? 80 : 104} height={height} itemCount={itemsCount} width={'100%'}
                      className={'p-0 m-0'}>
                    {renderListItem}
                </List>
                :
                <Grid
                    columnCount={columns}
                    columnWidth={width / columns}
                    height={height}
                    rowCount={Math.ceil(itemsCount / columns)}
                    rowHeight={isCompactMode ? 80 : 104}
                    width={width}
                >
                    {Cell}
                </Grid>
            }
        </div>
    )
})