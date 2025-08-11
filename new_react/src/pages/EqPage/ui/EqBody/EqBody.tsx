import React, {useEffect, useMemo, useState} from "react";

import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser} from "@shared/hooks";

import {useResizableBlocks} from '../../model/lib/useResizableBlocks';
import {useWindowDimensions} from "../../model/lib/useWindowDimensions";
import {getNoRelevantIds} from "../../model/selectors/cardSelectors";
import {eqFiltersReady} from "../../model/selectors/filterSelectors";
import {eqPageActions} from "../../model/slice/eqPageSlice";
import {DistributeBlock} from "../DistributeBlock/DistributeBlock";

import {EqWeeks} from "./blocks/EqWeeks";
import {BlockName} from "@widgets/EqCardList/ui/ui/BlockName";
import {InWorkBlock} from "./blocks/InWorkBlock";
import {ReadyBlock} from "@pages/EqPage/ui/EqBody/blocks/ReadyBlock";
import {AwaitBlock} from "@pages/EqPage/ui/EqBody/blocks/AwaitBlock";
import {PlanGhost} from "./widgets/PlanGhost";


export const EqBody = () => {
    const dispatch = useAppDispatch();
    const {queryParameters} = useAppQuery();
    const {currentUser} = useCurrentUser();

    const [expanded, setExpanded] = useState(queryParameters.view_mode === "distribute");

    useEffect(() => {
        setExpanded(queryParameters.view_mode === "distribute");
    }, [queryParameters.view_mode]);

    const filtersReady = useAppSelector(eqFiltersReady);

    const {windowWidth, windowHeight} = useWindowDimensions();

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
        y: -62,
    });

    const [blockSizes, setBlockSizes] = useState({
        leftBlockWidth: leftBlockWidth,
        rightBlockWidth: rightBlockWidth,
        inWorkHeight: inWorkHeight,
        readyHeight: readyHeight,
    });

    useEffect(() => {
        if (!isDragging) {
            setBlockSizes({
                leftBlockWidth: leftBlockWidth,
                rightBlockWidth: rightBlockWidth,
                inWorkHeight: inWorkHeight,
                readyHeight: readyHeight,
            })
        }
        //eslint-disable-next-line
    }, [isDragging, rightBlockWidth]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            resetSize();
        }, 200);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [resetSize, windowWidth, windowHeight]);

    const noRelevantIds = useAppSelector(getNoRelevantIds);
    const [awaitUpdated, setAwaitUpdated] = useState(false);
    const [inWorkUpdated, setInWorkUpdated] = useState(false);
    const [readyUpdated, setReadyUpdated] = useState(false);

    const depsInWork = useMemo(() => [inWorkUpdated], [inWorkUpdated]);
    const depsAwait = useMemo(() => [awaitUpdated], [awaitUpdated]);
    const depsReady = useMemo(() => [readyUpdated], [readyUpdated]);


    const [prevViewMode, setPrevViewMode] = useState(queryParameters.view_mode);

    useEffect(() => {
        setAwaitUpdated(prevState => !prevState);
        setInWorkUpdated(prevState => !prevState);
        setReadyUpdated(prevState => !prevState);
        // eslint-disable-next-line
    }, [queryParameters.project, queryParameters.search, currentUser.current_department]);

    useEffect(() => {
        if (['unfinished', 'boss'].includes(prevViewMode) || ['unfinished', 'boss'].includes(queryParameters.view_mode)) {
            setAwaitUpdated(prevState => !prevState);
        }
        if (!([undefined, 'self', 'distribute'].includes(prevViewMode) && [undefined, 'self', 'distribute'].includes(queryParameters.view_mode))) {
            setInWorkUpdated(prevState => !prevState);
        }

        setReadyUpdated(prevState => !prevState);

        setPrevViewMode(queryParameters.view_mode);
        // eslint-disable-next-line
    }, [queryParameters.view_mode]);

    useEffect(() => {
        setReadyUpdated(prevState => !prevState);
        // eslint-disable-next-line
    }, [queryParameters.week]);

    useEffect(() => {
        setReadyUpdated(prevState => !prevState);
        // eslint-disable-next-line
    }, [queryParameters.show_all]);

    useEffect(() => {
        setAwaitUpdated(prevState => !prevState);
        // eslint-disable-next-line
    }, [queryParameters.assembled, queryParameters.locked]);

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

    const showResizeBlock = useMemo(() => {
        return isDragging ? 'block' : 'none';
    }, [isDragging])

    return (
        <div className={'d-flex justify-content-center position-relative'} style={{
            background: "var(--bs-gray-300)",
            overflow: 'hidden',
            position: 'relative',
            height: `${windowHeight}px`,
            width: `${windowWidth}px`,
        }}>
            <PlanGhost/>

            <div style={{
                width: '100%',
                height: '100%',
                zIndex: 100000,
                position: 'absolute',
                display: showResizeBlock,
                opacity: 0.9,
                background: "var(--bs-gray-800)",
            }}>
                <div
                    className={'bg-danger'}
                    style={{
                        position: 'absolute',
                        top: inWorkHeight,
                        height: '2px',
                        width: leftBlockWidth,
                    }}
                >

                </div>
                <div
                    className={'h-100 bg-danger'}
                    style={{
                        position: 'absolute',
                        width: '2px',
                        left: leftBlockWidth,
                    }}
                />
            </div>

            {/*DISTRIBUTE BLOCK*/}
            {expanded && (
                <div
                    style={{
                        position: 'absolute',
                        width: blockSizes.leftBlockWidth,
                        maxWidth: '1200px',
                        right: blockSizes.rightBlockWidth,
                        top: 0,
                        height: windowHeight,
                    }}
                >
                    <DistributeBlock
                        deps={depsInWork}
                        noRelevantIds={noRelevantIds || []}
                    />
                    <BlockName name={"НАЗНАЧЕНЫ"}/>
                </div>
            )}

            <div className={'h-100 bg-black'}
                 style={{
                     position: 'absolute',
                     width: '2px',
                     left: blockSizes.leftBlockWidth,
                 }}
            />

            {/*IN WORK BLOCK*/}
            <InWorkBlock
                expanded={expanded}
                leftBlockWidth={blockSizes.leftBlockWidth}
                rightBlockWidth={blockSizes.rightBlockWidth}
                inWorkHeight={blockSizes.inWorkHeight}
                filtersReady={filtersReady || false}
                depsInWork={depsInWork}
                noRelevantIds={noRelevantIds}
            />

            {/*WEEK BLOCK*/}
            <EqWeeks
                inWorkHeight={blockSizes.inWorkHeight}
                rightBlockWidth={blockSizes.rightBlockWidth}
                leftBlockWidth={blockSizes.leftBlockWidth}
                expanded={expanded}
                drag={drag}
                resetSize={resetSize}
            />

            {/*READY BLOCK*/}
            {!expanded && (
                <ReadyBlock
                    expanded={expanded}
                    filtersReady={filtersReady || false}
                    deps={depsReady}
                    noRelevantIds={noRelevantIds}
                    inWorkHeight={blockSizes.inWorkHeight}
                    rightBlockWidth={blockSizes.rightBlockWidth}
                    leftBlockWidth={blockSizes.leftBlockWidth}
                    readyHeight={blockSizes.readyHeight}
                />
            )}

            {/*AWAIT BLOCK*/}
            <AwaitBlock
                expanded={expanded}
                inWorkHeight={blockSizes.inWorkHeight}
                readyHeight={blockSizes.readyHeight}
                windowHeight={windowHeight}
                leftBlockWidth={blockSizes.leftBlockWidth}
                rightBlockWidth={blockSizes.rightBlockWidth}
                filtersReady={filtersReady || false}
                depsAwait={depsAwait}
                noRelevantIds={noRelevantIds}
            />
        </div>
    );
};
