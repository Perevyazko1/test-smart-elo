import React, {useContext, useEffect, useState} from "react";

import {IsDesktopContext} from "@app";
import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser} from "@shared/hooks";
import {EqCardList} from "@widgets/EqCardList";

import {useResizableBlocks} from '../../model/lib/useResizableBlocks';
import {useWindowDimensions} from "../../model/lib/useWindowDimensions";
import {getNoRelevantIds} from "../../model/selectors/cardSelectors";
import {eqFiltersReady} from "../../model/selectors/filterSelectors";
import {eqPageActions} from "../../model/slice/eqPageSlice";
import {DistributeBlock} from "../DistributeBlock/DistributeBlock";

import {EqWeeks} from "./EqWeeks";
import {BlockName} from "@widgets/EqCardList/ui/ui/BlockName";

interface EqBodyProps {
    showClb: () => void;
}

export const EqBody = (props: EqBodyProps) => {
    const {showClb} = props;
    const dispatch = useAppDispatch();
    const {queryParameters} = useAppQuery();
    const {currentUser} = useCurrentUser();

    const [expanded, setExpanded] = useState(queryParameters.view_mode === "distribute");

    useEffect(() => {
        setExpanded(queryParameters.view_mode === "distribute");
    }, [queryParameters.view_mode]);

    const isDesktop = useContext(IsDesktopContext);
    const filtersReady = useAppSelector(eqFiltersReady);

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
        x: queryParameters.expanded ? -27 : 27,
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

    const noRelevantIds = useAppSelector(getNoRelevantIds);

    const [listUpdated, setListUpdated] = useState({
        "inWork": false,
        "await": false,
        "ready": false,
    });
    const [prevViewMode, setPrevViewMode] = useState(queryParameters.view_mode);

    useEffect(() => {
        setListUpdated({
            await: !listUpdated.await,
            inWork: !listUpdated.inWork,
            ready: !listUpdated.ready,
        });
        // eslint-disable-next-line
    }, [queryParameters.project, currentUser.current_department]);

    useEffect(() => {
        setListUpdated(prevData => {
            const newData = {...prevData};
            if (['unfinished', 'boss'].includes(prevViewMode) || ['unfinished', 'boss'].includes(queryParameters.view_mode)) {
                newData.await = !prevData.await;
            }
            if (!([undefined, 'self', 'distribute'].includes(prevViewMode) && [undefined, 'self', 'distribute'].includes(queryParameters.view_mode))) {
                newData.inWork = !prevData.inWork;
            }
            newData.ready = !prevData.ready;

            return newData;
        });
        setPrevViewMode(queryParameters.view_mode);
        // eslint-disable-next-line
    }, [queryParameters.view_mode]);

    useEffect(() => {
        setListUpdated(prevData => ({
            ...prevData,
            ready: !prevData.ready
        }));
        // eslint-disable-next-line
    }, [queryParameters.week]);

    useEffect(() => {
        setListUpdated(prevData => ({
            ...prevData,
            await: !prevData.await
        }));
        // eslint-disable-next-line
    }, [queryParameters.assembled]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (noRelevantIds && noRelevantIds.length > 0) {
                dispatch(eqPageActions.clearNotRelevantId());
            }
        }, 10000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [dispatch, noRelevantIds]);

    return (
        <div className={'d-flex justify-content-center'} style={{
            background: "var(--bs-gray-300)",
            overflow: 'hidden',
        }}>
            <div
                style={{
                    position: 'relative',
                    height: `${windowHeight}px`,
                    width: `${windowWidth}px`,
                }}
            >

                {/*DISTRIBUTE BLOCK*/}
                {expanded && (
                    <div
                        style={{
                            position: 'absolute',
                            width: leftBlockWidth,
                            maxWidth: '1200px',
                            right: rightBlockWidth,
                            top: 0,
                            height: windowHeight,
                        }}
                    >
                        <DistributeBlock
                            deps={[listUpdated.inWork]}
                            noRelevantIds={noRelevantIds || []}
                        />
                        <BlockName name={"НАЗНАЧЕНЫ"}/>
                    </div>
                )}

                <div className={'h-100 bg-black'}
                     style={{
                         position: 'absolute',
                         width: '2px',
                         left: leftBlockWidth,
                     }}/>

                {/*IN WORK BLOCK*/}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        ...(expanded ? {left: leftBlockWidth} : {right: rightBlockWidth}),
                        width: expanded ? rightBlockWidth : leftBlockWidth,
                        maxWidth: '1200px',
                        height: inWorkHeight,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 0.25rem',
                    }}
                >
                    <EqCardList
                        listType={'in_work'}
                        expanded={expanded}
                        inited={filtersReady || false}
                        deps={[listUpdated.inWork]}
                        noRelevantIds={noRelevantIds}
                    />
                </div>

                {/*WEEK BLOCK*/}
                <div
                    style={{
                        position: 'absolute',
                        top: `${inWorkHeight}px`,
                        ...(expanded ? {left: leftBlockWidth} : {right: rightBlockWidth}),
                        width: expanded ? rightBlockWidth : leftBlockWidth,
                        maxWidth: '1200px',
                        height: inWorkHeight,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 0.25rem',
                    }}
                >
                    <EqWeeks
                        rightBlockWidth={rightBlockWidth}
                        leftBlockWidth={leftBlockWidth}
                        expanded={expanded}
                        isDragging={isDragging}
                        showClb={showClb}
                        drag={drag}
                        resetSize={resetSize}
                    />
                </div>

                {/*READY BLOCK*/}
                {!expanded && (
                    <div
                        style={{
                            position: 'absolute',
                            top: inWorkHeight + 36,
                            right: rightBlockWidth,
                            width: leftBlockWidth,
                            maxWidth: "1200px",
                            height: readyHeight,
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            padding: '0 0 0 0.15rem',
                        }}
                    >
                        <EqCardList
                            listType={'ready'}
                            expanded={expanded}
                            inited={filtersReady || false}
                            deps={[listUpdated.ready]}
                            noRelevantIds={noRelevantIds}
                        />
                    </div>
                )}

                {/*AWAIT BLOCK*/}
                <div
                    style={{
                        position: 'absolute',
                        top: expanded ? inWorkHeight + 36 : 0,
                        height: expanded ? readyHeight : windowHeight,
                        left: leftBlockWidth,
                        width: rightBlockWidth,
                        maxWidth: "1200px",
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        padding: '0 0 0 .25rem',
                    }}
                >
                    <EqCardList
                        listType={'await'}
                        expanded={expanded}
                        inited={filtersReady || false}
                        deps={[listUpdated.await]}
                        noRelevantIds={noRelevantIds}
                    />
                </div>
            </div>

        </div>
    );
};
