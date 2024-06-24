import {useEffect, useState} from "react";

import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";

import cls from "../TaskPage.module.scss";

import {getNoRelevantId} from "../../model/selectors";
import {getTaskCard} from "../../model/api/getTaskCard";

import {AwaitSection} from "../Sections/AwaitSection";
import {Weeks} from "../Sections/Weeks";
import {InWorkSection} from "../Sections/InWorkSection";
import {ReadySection} from "../Sections/ReadySection";


export const TaskPageBody = () => {
    const [blockHeight] = useState((window.innerHeight - 87) / 2);
    const {queryParameters} = useQueryParams();
    const noRelevantId = useAppSelector(getNoRelevantId);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (noRelevantId && noRelevantId?.length > 0) {
            dispatch(getTaskCard({
                id: noRelevantId[0],
                ...queryParameters,
            }));
        }
    }, [dispatch, noRelevantId, queryParameters]);

    return (
        <div className={'pageContent d-flex'} style={{background: 'var(--bs-gray-300)'}}>
            <div className={cls.leftBlock}>
                <div style={{
                    height: `${blockHeight}px`,
                    overflowX: "hidden",
                    overflowY: "auto",
                    padding: ".15rem 0"
                }}>
                    <InWorkSection/>
                </div>

                <Weeks/>

                <div style={{height: `${blockHeight}px`}}>
                    <ReadySection/>
                </div>
            </div>

            <div className={cls.rightBlock}>
                <AwaitSection/>
            </div>

        </div>
    );
};
