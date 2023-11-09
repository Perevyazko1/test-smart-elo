import {useCallback, useState} from "react";

import {DynamicComponent, QueryContext, ReducersList} from "@features";

import {EqNav} from "../EqNav/EqNav";
import {EqBody} from "../EqBody/EqBody";
import {eqPageReducer} from "../../model/slice/eqPageSlice";


const initialReducers: ReducersList = {
    eqPage: eqPageReducer,
}

export const EqPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    const closeClb = useCallback(() => {
        setShowCanvas(false)
    }, [])

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            <QueryContext>
                <EqNav closeClb={closeClb} showCanvas={showCanvas}/>
                <EqBody showClb={() => setShowCanvas(true)}/>
            </QueryContext>
        </DynamicComponent>
    );
};
