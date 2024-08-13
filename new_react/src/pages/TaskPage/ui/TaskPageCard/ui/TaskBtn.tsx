import {useCallback, useMemo} from "react";
import {useAppDispatch, useAppModal, useClickSound, useCountdown, useCurrentUser} from "@shared/hooks";
import {Task, TaskStatus} from "@pages/TaskPage";
import {updateTask} from "@pages/TaskPage/model/api/updateTask";
import {UpdateTask} from "@pages/TaskPage/model/types";

interface TaskBtnProps {
    cardType: TaskStatus;
    card: Task;
    first: boolean;
}

export const TaskBtn = (props: TaskBtnProps) => {
    const {card, cardType, first} = props;

    const {currentUser} = useCurrentUser();
    const {handleOpen} = useAppModal();
    const playSound = useClickSound();
    const dispatch = useAppDispatch();

    const initialTimer = {
        targetDate: first ? card.deadline : undefined,
        startDate: card.ready_at || undefined,
    }

    const timeLeft = useCountdown(initialTimer);

    const locked = useMemo(() => {
        if (cardType === TaskStatus.InProgress) {
            return card.appointed_by?.id !== currentUser.id
        }
        if (cardType === TaskStatus.Completed) {
            return card.created_by?.id !== currentUser.id
        }
        return false
    }, [card.appointed_by?.id, card.created_by?.id, cardType, currentUser.id]);

    const getButtonVariant = useMemo(() => {
        if ((timeLeft && timeLeft?.days > 0) || (!timeLeft)) {
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
        } else if (timeLeft && timeLeft?.hours > 2) {
            switch (card.urgency) {
                case '4':
                    return "redBtn"
                case '3':
                    return "yellowBtn"
                case '2':
                    return "yellowBtn"
                case '1':
                    return "yellowBtn"
                default:
                    return "yellowBtn"
            }
        } else {
            return "redBtn"
        }
        //eslint-disable-next-line
    }, [card.urgency, timeLeft?.hours, timeLeft?.days]);

    const getButtonIcon = useCallback(() => {
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
    }, [cardType, first, locked]);

    const getActionData = (): UpdateTask => {
        if (cardType === TaskStatus.Pending) {
            const data: UpdateTask = {
                id: card.id,
                status: TaskStatus.InProgress,
                executor: card.executor?.id || currentUser.id,
                co_executors: card.co_executors?.map(user => user.id),
                for_departments: card.for_departments?.map(department => department.id),
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
                for_departments: card.for_departments?.map(department => department.id),
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
                for_departments: card.for_departments?.map(department => department.id),
            };
        } else if (cardType === TaskStatus.Completed && first) {
            return {
                id: card.id,
                verified_at: new Date().toISOString(),
                co_executors: card.co_executors?.map(user => user.id),
                for_departments: card.for_departments?.map(department => department.id),
            };
        } else {
            return {
                id: card.id,
                ready_at: '',
                status: TaskStatus.InProgress,
                co_executors: card.co_executors?.map(user => user.id),
                for_departments: card.for_departments?.map(department => department.id),
            };
        }
    }

    const updClb = () => {
        playSound()
        if (cardType === TaskStatus.InProgress && !first && locked) {
            handleOpen(
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
            handleOpen(
                <h4 className={'my-5'}>
                    Завизировать выполнение задачи может пользователь, который создал данную задачу.
                </h4>
            )
        } else {
            dispatch(updateTask(getActionData()));
        }
    }


    return (
        <button
            className={`appBtn rounded rounded-2 h-100 ${getButtonVariant}`}
            onClick={() => updClb()}
            style={{minWidth: '39px', maxWidth: '39px'}}
        >
            {timeLeft &&
                <>
                    <div style={{fontSize: '9px'}}>
                        {timeLeft.weeks !== 0 &&
                            <b>{timeLeft.weeks}нед<br/></b>
                        }
                        <b>{timeLeft.days}д{timeLeft.hours}ч</b>
                        <br/>
                        <b>{timeLeft.minutes}м{timeLeft.seconds}с</b>
                    </div>
                    <br/>
                </>
            }
            {getButtonIcon()}
        </button>
    );
};
