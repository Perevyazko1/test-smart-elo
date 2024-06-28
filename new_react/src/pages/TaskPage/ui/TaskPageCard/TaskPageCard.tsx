import {AppSlider} from "@shared/ui";
import {useAppDispatch, useAppModal, useClickSound, useCountdown, useCurrentUser} from "@shared/hooks";
import {TaskForm} from "@widgets/TaskForm";

import cls from "../TaskPage.module.scss";

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

    const playSound = useClickSound();

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
                    closeModal()
                }}
            />
        )
    };

    const editLocked = useMemo(() => {
        return card.created_by?.id !== currentUser.id;
    }, [card.created_by, currentUser]);

    const locked = useMemo(() => {
        if (cardType === TaskStatus.InProgress) {
            return card.appointed_by?.id !== currentUser.id
        }
        if (cardType === TaskStatus.Completed) {
            return card.created_by?.id !== currentUser.id
        }
        return false
    }, [card.appointed_by?.id, card.created_by?.id, cardType, currentUser.id]);

    const getButtonIcon = useCallback((first: boolean) => {
        if (cardType === TaskStatus.Pending) {
            return <i className="fas fa-angle-double-left fs-2"/>;
        } else if (cardType === TaskStatus.InProgress && locked && !first) {
            return <i className="fas fa-lock fs-5"/>;
        } else if (cardType === TaskStatus.Completed && locked && first) {
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
        playSound()
        if (cardType === TaskStatus.InProgress && !first && locked) {
            openModal(
                <>
                    <h4 className={'my-5'}>
                        Задачу нельзя вернуть в ожидание так как она была назначена персонально.
                    </h4>
                    <h4 className={'my-5'}>
                        Вернуть задачу в ожидание может пользователь назначивший задачу.
                    </h4>
                </>
            )
        } else if (cardType === TaskStatus.Completed && first && locked) {
            openModal(
                <h4 className={'my-5'}>
                    Завизировать выполнение задачи может пользователь, который создал данную задачу.
                </h4>
            )
        } else {
            dispatch(updateTask(getActionData(first)));
        }
    }

    const getActionData = (first: boolean): UpdateTask => {
        if (cardType === TaskStatus.Pending) {
            const data: UpdateTask = {
                id: card.id,
                status: TaskStatus.InProgress,
                executor: card.executor?.id || currentUser.id,
                co_executors: card.co_executors?.map(user => user.id),
            };
            if (!card.appointed_at) {
                data.appointed_at = new Date().toISOString();
            }
            if (!card.appointed_by) {
                data.appointed_by = currentUser.id;
            }
            return data;
        } else if (cardType === TaskStatus.InProgress && !first) {
            const data: UpdateTask = {
                id: card.id,
                status: TaskStatus.Pending,
                co_executors: card.co_executors?.map(user => user.id),
            }
            if (card.appointed_by?.id === currentUser.id) {
                if (card.executor?.id === currentUser.id) {
                    data.executor = null;
                }
            }
            return data;
        } else if (cardType === TaskStatus.InProgress && first) {
            return {
                id: card.id,
                status: TaskStatus.Completed,
                ready_at: new Date().toISOString(),
                co_executors: card.co_executors?.map(user => user.id),
            };
        } else if (cardType === TaskStatus.Completed && first) {
            return {
                id: card.id,
                verified_at: new Date().toISOString(),
                co_executors: card.co_executors?.map(user => user.id),
            };
        } else {
            return {
                id: card.id,
                ready_at: '',
                status: TaskStatus.InProgress,
                co_executors: card.co_executors?.map(user => user.id),
            };
        }
    }

    const hideFirstBtn = useMemo(() => {
        if (cardType === TaskStatus.Completed && card.verified_at) {
            return true;
        }
        return card.status === TaskStatus.Cancelled;
    }, [card.status, card.verified_at, cardType]);

    const timeLeft = useCountdown(hideFirstBtn ? undefined : card.deadline);

    const hideSecondBtn = useMemo(() => {
        return cardType === TaskStatus.Pending || card.verified_at || card.status === TaskStatus.Cancelled;
    }, [card.status, card.verified_at, cardType]);

    return (
        <div style={{padding: ".1rem", maxWidth: '1300px'}}>
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
                        style={{minWidth: '39px', maxWidth: '39px'}}
                    >
                        {timeLeft &&
                            <>
                                <div style={{fontSize: '10px'}}>
                                    <b>{timeLeft.days}д{timeLeft.hours}ч</b>
                                    <br/>
                                    <b>{timeLeft.minutes}м{timeLeft.seconds}с</b>
                                </div>
                                <br/>
                            </>
                        }
                        {getButtonIcon(true)}
                    </button>
                }

                <div className={cls.sliderBlock + ' bg-light rounded'}
                     style={{
                         width: '72px',
                         minWidth: '72px',
                         maxWidth: '72px',
                     }}
                     onClick={() => {
                         card.task_images && card.task_images.length > 0 && openModal(
                             <AppSlider
                                 width={'90vw'}
                                 height={'90vh'}
                                 images={card.task_images?.map(image => image.image)}
                             />
                         )
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
                    CОЗД:<b>{getHumansDatetime(card.created_at || "", 'short')}</b>
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

                <div className={'bg-light rounded fs-7'}
                     style={{
                         padding: '0 .3rem 0 .1rem',
                         overflowY: 'hidden',
                         overflowX: 'auto',
                         minWidth: '90px'
                     }}
                >
                    Создал:<br/>
                    <b className={'text-nowrap'}>{getEmployeeName(card.created_by, 'short')}</b>
                    <br/>
                    Исполнитель:<br/>
                    <b className={'text-nowrap'}>{getEmployeeName(card.executor, 'short')}</b>
                </div>

                {!hideSecondBtn &&
                    <button
                        className={`appBtn p-1 rounded rounded-2 h-100 ${getButtonVariant(false)}`}
                        onClick={() => updClb(false)}
                        style={{minWidth: '39px', maxWidth: '39px'}}
                    >
                        {getButtonIcon(false)}
                    </button>
                }

            </div>

        </div>
    )
        ;
};
