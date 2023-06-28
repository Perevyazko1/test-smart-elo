import {useEffect} from "react";
import {Row} from "react-bootstrap";

import useWindowDimensions from "shared/lib/hooks/useWindowDimensions/useWindowDimensions";
import useResizableBlocks from "shared/lib/hooks/useResizableBlocks/useResizableBlocks";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {fetchListData} from "../../../model/service/apiDesktop/fetchListData";
import {eqContentDesktopReducer} from "../../../model/slice/eqContentDesktopSlice";
import {EqDesktopCard} from "../../widgets/EqCard/ui/EqDesktopCard/EqDesktopCard";
import {EqWeekBlock} from "./EqWeekBlock/EqWeekBlock";
import cls from "./EqDesktopContent.module.scss";
import {useSelector} from "react-redux";
import {getEqAwaitList} from "../../../model/selectors/desktopSelectors/desktopSelectors";

const initialReducers: ReducersList = {
    eqDesktop: eqContentDesktopReducer,
}


const EqDesktopContent = () => {
    const {windowWidth, windowHeight} = useWindowDimensions(-57);
    const {
        leftBlockWidth,
        rightBlockWidth,
        inWorkHeight,
        readyHeight,
        isDragging,
        drag
    } = useResizableBlocks(windowWidth, windowHeight);

    const dispatch = useAppDispatch();
    const awaitList = useSelector(getEqAwaitList.selectAll)

    useEffect(() => {
        dispatch(fetchListData({
            target_list: 'await',
            offset: 0,
            limit: 10,
        }))
    }, [dispatch])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <div className={'d-flex'}>
                <div
                    style={{
                        width: `${leftBlockWidth}px`,
                        height: `${windowHeight}`
                    }}
                >
                    <Row
                        className={cls.inWorkBlock}
                        style={{
                            height: `${inWorkHeight}px`
                        }}
                    >

                    </Row>

                    <EqWeekBlock drag={drag} isDragging={isDragging}/>

                    <Row
                        className={cls.readyBlock}
                        style={{
                            height: `${readyHeight}px`,
                        }}
                    >
                        {/*<Col sm={leftBlockWidth > 2000 ? 6 : 12} className={cls.cardWrapper}>Карточка</Col>*/}
                    </Row>

                </div>


                <Row
                    className={cls.awaitBlock}
                    style={{
                        width: `${rightBlockWidth}px`,
                        height: `${windowHeight}px`,
                    }}
                >
                    {awaitList.map((eq_card) => (
                        <EqDesktopCard
                            blockWidth={rightBlockWidth}
                            eqCard={eq_card}
                            cardType={'await'}
                            key={eq_card.series_id}
                        />
                    ))}
                </Row>
            </div>
        </DynamicModuleLoader>
    );
};

export default EqDesktopContent;