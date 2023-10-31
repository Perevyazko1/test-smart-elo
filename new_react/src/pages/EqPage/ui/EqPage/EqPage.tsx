import {useCallback, useState} from "react";

import {DinamicComponent, ReducersList} from "@shared/components";

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
        <DinamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            <EqNav closeClb={closeClb} showCanvas={showCanvas}/>
            <EqBody showClb={() => setShowCanvas(true)}/>
        </DinamicComponent>
    );
};
