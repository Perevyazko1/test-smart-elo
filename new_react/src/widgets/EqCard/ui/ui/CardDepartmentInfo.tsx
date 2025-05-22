import {useEffect, useMemo, useState} from "react";
import {Spinner} from "react-bootstrap";

import {AssignmentInfo} from "@widgets/AssignmentInfo";
import {EqOrderProduct, ListTypes} from "@widgets/EqCardList";
import {useEditAssignmentInfo} from "@widgets/AssignmentInfo/model/api/api";

import {useAppModal, useCurrentUser, usePermission, useQueryParams} from "@shared/hooks";
import {AppSwitch} from "@shared/ui";
import {APP_PERM} from "@shared/consts";

import cls from "./EqCard.module.scss";
import {TimingWidget} from "@pages/TarifficationPage/ui/nav/TimingWidget";


interface CardDepartmentInfoProps {
    card: EqOrderProduct;
    listType: ListTypes,
}

export const CardDepartmentInfo = (props: CardDepartmentInfoProps) => {
    const {card, listType} = props;
    const {handleOpen} = useAppModal();
    const {currentUser} = useCurrentUser();
    const {queryParameters} = useQueryParams();
    const [locked, setLocked] = useState(card.assignments.some(item => item.appointed_by_boss));
    const [editAssignments, {isLoading}] = useEditAssignmentInfo();

    const isBoss = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);

    const showTiming = useMemo(() => {
        const localValue = localStorage.getItem(`${listType}timing`)
        return !!localValue;
        //eslint-disable-next-line
    }, [listType, queryParameters.sortUpdated]);

    useEffect(() => {
        setLocked(card.assignments.some(item => item.appointed_by_boss));
    }, [card.assignments]);

    const lockedHandle = () => {
        if (currentUser.current_department) {
            setLocked(!locked)
            editAssignments({
                department__id: currentUser.current_department.id,
                series_id: card.series_id,
                ids: [],
                date: '',
                mode: 'lock_await_assignments'
            })
        }
    };

    const modalHandle = () => {
        if (!showTiming) {
            handleOpen(
                <AssignmentInfo seriesId={card.series_id} title={card.product.name}/>,
                true
            );
        }
    };

    return (
        <div
            className={cls.depInfoBlock + ' bg-light rounded fs-7 fw-bold'}
            onClick={modalHandle}
        >
            {isBoss && listType === 'await' ?
                <AppSwitch
                    onClick={(e) => e.stopPropagation()}
                    className={'my-1'}
                    disabled={isLoading}
                    style={{
                        transform: 'scale(0.85)',
                    }}
                    checked={locked}
                    onSwitch={lockedHandle}
                    handleContent={isLoading ?
                        <div style={{transform: 'scale(0.6)'}}>
                            <Spinner
                                animation={'grow'}
                                size={'sm'}
                            />
                        </div>
                        : '🔒'
                    }
                    labelPosition={'labelBottom'}
                />
                : null
            }

            {showTiming ? (
                <TimingWidget
                    ps_id={card.card_info.ps_id}
                    scheduled_time={card.card_info.timing}
                />
            ) : (
                <>
                    {
                        card.card_info.employees_info.map((info, index) => (
                            <div key={index}>
                                <div className={'d-flex justify-content-between gap-1'}>
                                    <span>{info.full_name}</span>
                                    <span>{info.count_all} ({info.count_in_work})</span>
                                </div>
                                <hr className={'m-0 p-0'}/>
                            </div>
                        ))
                    }
                </>
            )}
        </div>
    );
};
