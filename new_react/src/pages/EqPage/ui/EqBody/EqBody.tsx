import React, {useContext, useEffect, useMemo, useState} from "react";
import {motion} from "framer-motion";

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

interface EqBodyProps {
    showClb: () => void;
}

export const EqBody = (props: EqBodyProps) => {
    const {showClb} = props;
    const dispatch = useAppDispatch();
    const {queryParameters} = useAppQuery();
    const {currentUser} = useCurrentUser();

    const [durationValue, setDurationValue] = useState(0.3);
    const [expanded, setExpanded] = useState(queryParameters.view_mode === "distribute");

    useEffect(() => {
        setDurationValue(0.3);
        setExpanded(queryParameters.view_mode === "distribute");
        setTimeout(() => {
            setDurationValue(0);
        }, 500);
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
        console.log('Effect:', windowWidth, windowHeight);

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

    const distributeBlock = useMemo(() => (
        expanded && (
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                style={{
                    position: 'absolute',
                    width: `${leftBlockWidth}px`,
                    left: 0,
                    top: 0,
                    height: `${windowHeight}px`,
                }}
                transition={{duration: durationValue}}
            >
                <DistributeBlock
                    deps={[listUpdated.inWork]}
                    noRelevantIds={noRelevantIds || []}
                />
            </motion.div>
        )
    ), [expanded, leftBlockWidth, windowHeight, durationValue, listUpdated.inWork, noRelevantIds]);

    const inWorkBlock = useMemo(() => (
        <motion.div
            style={{
                position: 'absolute',
                top: 0,
                ...(expanded ? {right: '0'} : {left: '0'}),
                width: expanded ? rightBlockWidth : leftBlockWidth,
                height: `${inWorkHeight}px`,
                overflowX: 'hidden',
                overflowY: 'auto',
                padding: '0 0 0 0.25rem',
            }}
            initial={{
                right: expanded ? 0 : rightBlockWidth,
            }}
            animate={{
                right: expanded ? 0 : rightBlockWidth,
            }}
            transition={{duration: durationValue}}
        >
            <EqCardList
                listType={'in_work'}
                expanded={expanded}
                inited={filtersReady || false}
                deps={[listUpdated.inWork]}
                noRelevantIds={noRelevantIds}
            />
        </motion.div>
    ), [expanded, rightBlockWidth, leftBlockWidth, inWorkHeight, durationValue, filtersReady, listUpdated.inWork, noRelevantIds]);

    const readyBlock = useMemo(() => (
        !expanded && (
            <motion.div
                style={{
                    position: 'absolute',
                    top: `${inWorkHeight + 36}px`,
                    left: 0,
                    width: leftBlockWidth,
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
            </motion.div>
        )
    ), [expanded, inWorkHeight, leftBlockWidth, readyHeight, filtersReady, listUpdated.ready, noRelevantIds]);

    const awaitBlock = useMemo(() => (
        <motion.div
            style={{
                position: 'absolute',
                top: expanded ? `${inWorkHeight + 36}px` : 0,
                left: leftBlockWidth,
                width: rightBlockWidth,
                height: expanded ? windowHeight : readyHeight,
                overflowX: 'hidden',
                overflowY: 'auto',
                padding: '0 0 0 .25rem',
            }}
            initial={{
                top: expanded ? `${inWorkHeight + 36}px` : 0,
                height: expanded ? `${readyHeight}px` : `${windowHeight}px`,
            }}
            animate={{
                top: expanded ? `${inWorkHeight + 36}px` : 0,
                height: expanded ? `${readyHeight}px` : `${windowHeight}px`,
            }}
            transition={{duration: durationValue}}
        >
            <EqCardList
                listType={'await'}
                expanded={expanded}
                inited={filtersReady || false}
                deps={[listUpdated.await]}
                noRelevantIds={noRelevantIds}
            />
        </motion.div>
    ), [expanded, inWorkHeight, leftBlockWidth, rightBlockWidth, readyHeight, windowHeight, durationValue, filtersReady, listUpdated.await, noRelevantIds]);

    return (
        <div
            style={{
                position: 'relative',
                height: `${windowHeight}px`,
                background: "var(--bs-gray-300)",
                overflow: 'hidden',
            }}
        >
            {distributeBlock}

            <div className={'h-100 bg-black'} style={{
                position: 'absolute',
                width: '2px',
                left: `${leftBlockWidth}px`
            }}/>

            {inWorkBlock}

            <EqWeeks
                inWorkHeight={inWorkHeight}
                rightBlockWidth={rightBlockWidth}
                leftBlockWidth={leftBlockWidth}
                expanded={expanded}
                isDragging={isDragging}
                showClb={showClb}
                drag={drag}
                resetSize={resetSize}
            />

            {readyBlock}

            {awaitBlock}
        </div>
    );
};
