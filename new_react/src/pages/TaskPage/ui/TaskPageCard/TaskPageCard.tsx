import {AppSlider} from "@shared/ui";
import cls from "../TaskPage.module.scss";
import {useAppDispatch, useAppModal, useCurrentUser} from "@shared/hooks";
import {TaskForm} from "@widgets/TaskForm";

import {getEmployeeName, getHumansDatetime} from "@shared/lib";
import {getViewModeText, TaskStatus} from "@pages/TaskPage";

import {Task, UpdateTask} from "../../model/types";
import {useCallback, useMemo} from "react";
import {updateTask} from "@pages/TaskPage/model/api/updateTask";

interface TaskPageCardProps {
    card: Task;
    cardType: TaskStatus;
}

export const TaskPageCard = (props: TaskPageCardProps) => {
    const {card, cardType} = props;
    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();

    const cardHeight = 80;
    const {openModal, closeModal} = useAppModal();

    const viewClb = () => {
        openModal(
            <TaskForm
                variant={'read_only'}
                task={card}
            />
        )
    };

    const editClb = () => {
        openModal(
            <TaskForm
                variant={'edit'}
                task={card}
                onSubmitClb={() => {
                    alert('Задача успешно изменена')
                    closeModal()
                }}
            />
        )
    };
    
    const editLocked = useMemo(() => {
        return card.appointed_by?.id !== currentUser.id;
    }, [card.appointed_by, currentUser])

    const locked = false;

    const getButtonIcon = useCallback((first: boolean) => {
        if (cardType === TaskStatus.Pending) {
            return <i className="fas fa-angle-double-left fs-2"/>;
        } else if (locked) {
            return <i className="fas fa-lock fs-5"/>;
        } else if (cardType === TaskStatus.InProgress && first) {
            return <i className="fas fa-check fs-3"/>;
        } else if (cardType === TaskStatus.InProgress && !first) {
            return <i className="fas fa-angle-double-right fs-2"/>;
        } else if (cardType === TaskStatus.Completed && first) {
            return <i className="fas fa-check-double fs-3"/>;
        } else {
            return <i className="fas fa-angle-double-up fs-2"/>;
        }
    }, [cardType, locked]);

    const getButtonVariant = (first: boolean) => {
        if (first) {
            switch (card.urgency) {
                case '4':
                    return "redBtn"
                case '3':
                    return "yellowBtn"
                case '2':
                    return "greenBtn"
                case '1':
                    return "greyBtn"
                default:
                    return "greenBtn"
            }
        }
        return "greenBtn"
    }

    const updClb = (first: boolean) => {
        dispatch(updateTask(getActionData(first)));
    }

    const getActionData = (first: boolean): UpdateTask => {
        if (cardType === TaskStatus.Pending) {
            return {
                id: card.id,
                status: TaskStatus.InProgress,
                executor: currentUser.id,
            };
        } else if (cardType === TaskStatus.InProgress && first) {
            return {
                id: card.id,
                status: TaskStatus.Completed,
                ready_at: new Date().toISOString(),
            };
        } else if (cardType === TaskStatus.InProgress && !first) {
            return {
                id: card.id,
                status: TaskStatus.Pending,
                executor: null,
            };
        } else if (cardType === TaskStatus.Completed && first) {
            return {
                id: card.id,
                verified_at: new Date().toISOString(),
            };
        } else {
            return {
                id: card.id,
                verified_at: '',
                status: TaskStatus.InProgress,
            };
        }
    }

    const hideFirstBtn = useMemo(() => {
        return cardType === TaskStatus.Completed && card.verified_at
    }, [card.verified_at, cardType]);

    const hideSecondBtn = useMemo(() => {
        return cardType === TaskStatus.Pending || card.verified_at
    }, [card.verified_at, cardType]);

    return (
        <div style={{padding: ".1rem"}}>
            <div className={'d-flex justify-content-start rounded rounded-2 border border-1 bg-black'}
                 style={{
                     width: "100%",
                     height: `${cardHeight}px`,
                     padding: ".1rem",
                     overflow: 'hidden',
                     gap: '0.15rem',
                 }}
            >

                {!hideFirstBtn &&
                    <button
                        className={`appBtn p-1 rounded rounded-2 h-100 ${getButtonVariant(true)}`}
                        onClick={() => updClb(true)}
                    >
                        {getButtonIcon(true)}
                    </button>
                }

                <div className={cls.sliderBlock + ' bg-light rounded'}
                     style={{
                         width: '72px',
                         minWidth: '72px',
                         maxWidth: '72px',
                     }}
                >
                    <AppSlider
                        width={'100%'}
                        height={'100%'}
                        images={card.task_images?.map(image => image.thumbnail)}
                    />
                </div>

                <div className={'bg-light rounded ' + cls.textBlock}>
                    № {card.id} {card.title}
                    <hr className={'m-0 p-0'}/>
                    <p className={'fs-7'}>
                        {card.description}
                    </p>
                </div>

                <div className={'bg-light rounded fs-7 text-nowrap'} style={{padding: '0 .1rem'}}>
                    СРОК:<b>{getHumansDatetime(card.deadline || "", 'short')}</b>
                    <hr className={'m-0 p-0'}/>
                    ГОТВ:<b>{getHumansDatetime(card.ready_at || "", 'short')}</b>
                    <hr className={'m-0 p-0'}/>
                    ВИД:<b>{getViewModeText(card.view_mode)}</b>
                    <hr className={'m-0 p-0'}/>
                    CОЗД:<b>{getHumansDatetime(card.created || "", 'short')}</b>
                </div>

                <div
                    className={'d-flex flex-column rounded rounded-2 h-100'}
                    style={{gap: '0.15rem'}}
                >
                    <div className={'h-50 d-flex'}>
                        <button
                            className={'appBtn rounded p-1 greenBtn text-dark flex-fill'}
                            onClick={viewClb}
                        >
                            <i className="far fa-eye"/>
                        </button>
                    </div>

                    <div className={'h-50 d-flex'}>
                        <button className={'appBtn rounded p-1 yellowBtn text-dark flex-fill'}
                                onClick={editClb}
                                disabled={!!card.verified_at || editLocked}
                        >
                            <i className="far fa-edit"/>
                        </button>
                    </div>
                </div>

                <div className={'bg-light rounded fs-7'} style={{padding: '0 .1rem'}}>
                    Назначил:<br/>
                    <b>{getEmployeeName(card.appointed_by, 'short')}</b>
                    <br/>
                    Ответственный:<br/>
                    <b>{getEmployeeName(card.executor, 'short')}</b>
                </div>

                {!hideSecondBtn &&
                    <button
                        className={`appBtn p-1 rounded rounded-2 h-100 ${getButtonVariant(false)}`}
                        onClick={() => updClb(false)}
                    >
                        {getButtonIcon(false)}
                    </button>
                }
            </div>

        </div>
    );
};
