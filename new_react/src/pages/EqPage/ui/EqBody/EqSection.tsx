import React, {CSSProperties, memo, useCallback, useEffect, useMemo, useState} from "react";
import {FixedSizeGrid as Grid, FixedSizeList as List, ListChildComponentProps} from 'react-window';

import {
    useAppDispatch,
    useAppQuery,
    useAppSelector,
    useCompactMode,
    useCurrentUser,
    usePagination
} from "@shared/hooks";
import {AppSkeleton} from "@shared/ui";

import {
    getAwaitListInfo,
    getEqAwaitList,
    getEqInWorkList,
    getEqReadyList,
    getInWorkListInfo, getReadyListInfo
} from "../../model/selectors/cardSelectors";
import {fetchListData} from "../../model/api/fetchListData";
import {ListTypes} from "../../model/consts/listTypes";
import {EqSectionCard} from "../EqSectionCard/EqSectionCard";

interface EqSectionProps {
    listType: ListTypes;
    height: number;
    width: number;
}

export const EqSection = memo((props: EqSectionProps) => {
    const {height, width, listType} = props;
    const dispatch = useAppDispatch();
    const {isCompactMode} = useCompactMode();
    const {currentUser} = useCurrentUser();
    const {queryParameters} = useAppQuery();

    const pageSelector = useMemo(
        () => listType === 'await' ?
            getAwaitListInfo : listType === 'in_work' ?
                getInWorkListInfo :
                getReadyListInfo,
        [listType]);
    const listProps = useAppSelector(pageSelector);

    const getElementHeight = useCallback(() => {
        if (isCompactMode) {
            return 80;
        } else {
            return 104;
        }
    }, [isCompactMode])

    const getLimit = useCallback(() => {
        if (height) {
            return Math.trunc(height / getElementHeight() * 1.3)
        }
    }, [getElementHeight, height])

    const {limit, offset, updated} = usePagination(getLimit(), listProps.count,
        [
            currentUser.current_department,
            queryParameters.view_mode,
            queryParameters.project,
        ]
    );
    const [lastIndex, setLastIndex] = useState<number>();

    const cardList = useAppSelector(listType === 'await' ?
        getEqAwaitList.selectAll : listType === 'in_work' ?
            getEqInWorkList.selectAll :
            getEqReadyList.selectAll
    )

    useEffect(() => {
        if (limit) {
            console.log('Пошел запрос', listType, offset, limit)
            dispatch(fetchListData({
                target_list: listType,
                offset: offset,
                limit: limit,
                ...queryParameters,
            }))
        }
    }, [dispatch, updated])

    const columns = Math.trunc(width / 800)

    const renderListItem = useCallback((props: ListChildComponentProps) => {
        const {isScrolling, index, ...otherProps} = props;

        // Устанавливаем позицию последнего отрендеренного элемента
        lastIndex && index > lastIndex && setLastIndex(index);

        if (cardList.length < (index + 1)) {
            return <AppSkeleton className={'mt-1 pb-05'} {...otherProps}/>
        }
        const card = cardList[index]

        return (
            <EqSectionCard {...otherProps} card={card}/>
        );
    }, [cardList, lastIndex]);

    const Cell = useCallback((props: { columnIndex: number, rowIndex: number, style: CSSProperties }) => {
        const card = cardList[props.columnIndex]

        return (
            <EqSectionCard style={props.style} card={card}/>
        );
    }, [cardList]);


    return (
        <div style={{width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
            {width < 1400 ?
                <List itemSize={getElementHeight()} height={height} itemCount={listProps.count || 0} width={'100%'}
                      className={'p-0 m-0'}>
                    {renderListItem}
                </List>
                :
                <Grid
                    columnCount={columns}
                    columnWidth={width / columns}
                    height={height}
                    rowCount={Math.ceil(cardList.length / columns)}
                    rowHeight={getElementHeight()}
                    width={width}
                >
                    {Cell}
                </Grid>
            }
        </div>
    )
})