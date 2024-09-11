import {HTMLAttributes, memo, useMemo} from "react";


import {getViewModeText, Task, TaskStatus} from "@entities/Task";
import {TaskForm} from "@widgets/TaskForm";
import {AppSlider} from "@shared/ui";
import {useAppModal, useCurrentUser, useEmployeeName} from "@shared/hooks";
import {getHumansDatetime} from "@shared/lib";

import cls from "../TaskPage.module.scss";

import {TaskBtn} from "./ui/TaskBtn";

interface TaskPageCardProps extends HTMLAttributes<HTMLDivElement> {
    card: Task;
    cardType: TaskStatus;
    scaled?: boolean;
}

export const TaskPageCard = memo((props: TaskPageCardProps) => {
    const {card, cardType, scaled, ...otherProps} = props;
    const {currentUser} = useCurrentUser();
    const {getNameById} = useEmployeeName();

    const cardHeight = 80;
    const {handleOpen, closeNoConfirm} = useAppModal();

    const viewClb = () => {
        handleOpen(
            <TaskForm
                variant={'read_only'}
                task={card}
                onSubmitClb={closeNoConfirm}
            />,
            true,
        );
    };

    const editClb = () => handleOpen(
        <TaskForm
            variant={'edit'}
            task={card}
            onSubmitClb={closeNoConfirm}
        />
        , true
    )

    const editLocked = useMemo(() => {
        return card.created_by !== currentUser.id;
    }, [card.created_by, currentUser]);

    const hideFirstBtn = useMemo(() => {
        if (cardType === TaskStatus.Completed && card.verified_at) {
            return true;
        }
        return card.status === TaskStatus.Cancelled;
    }, [card.status, card.verified_at, cardType]);

    const hideSecondBtn = useMemo(() => {
        return cardType === TaskStatus.Pending || card.verified_at || card.status === TaskStatus.Cancelled;
    }, [card.status, card.verified_at, cardType]);

    const userAmount = useMemo(() => {
        const allCardExecutors = [card.new_executor, ...card.new_co_executors];

        const currentExecutor = allCardExecutors.find(item => item?.employee === currentUser.id);

        return currentExecutor?.amount || undefined;
    }, [card.new_co_executors, card.new_executor, currentUser.id]);

    const cardAmount = useMemo(() => {
        return card.confirmed_tariff?.amount || card.proposed_tariff?.amount || 0;
    }, [card.confirmed_tariff?.amount, card.proposed_tariff?.amount]);

    return (
        <div style={{padding: ".1rem", maxWidth: '1300px'}} {...otherProps}>
            <div
                className={`d-flex justify-content-start rounded rounded-2 border border-1 bg-black ${scaled ? "scaled" : ""}`}
                 style={{
                     width: "100%",
                     height: `${cardHeight}px`,
                     padding: ".1rem",
                     overflow: 'hidden',
                     gap: '0.15rem',
                 }}
            >

                {!hideFirstBtn &&
                    <TaskBtn
                        first={true}
                        card={card}
                        cardType={cardType}
                    />
                }

                <div className={cls.sliderBlock + ' bg-light rounded position-relative'}
                     style={{
                         width: '72px',
                         minWidth: '72px',
                         maxWidth: '72px',
                     }}
                     onClick={() => {
                         card.task_images && card.task_images.length > 0 && handleOpen(
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
                        price={userAmount}
                        totalPrice={cardAmount}
                        bgColor={card.confirmed_tariff ? " bg-light" : " bg-warning"}
                    />
                    {card.new_comment_count > 0 &&
                        <div
                            className={'position-absolute bg-danger d-flex justify-content-center align-items-center border border-dark border-1'}
                            style={{
                                fontSize: '8px',
                                borderRadius: '50%',
                                height: '12px',
                                width: '12px',
                                top: 0,
                                right: 0,
                            }}
                        >
                            <b>{card.new_comment_count}</b>
                        </div>
                    }
                </div>

                <div className={'bg-light rounded ' + cls.textBlock}>
                    № {card.id} {card.title}

                    {card.description &&
                        <>
                            <hr className={'mt-1 m-0 p-0'}/>
                            <div className={'fs-7 pb-1'}>
                                {card.description}
                            </div>
                        </>
                    }

                    {card.last_comment &&
                        <>
                            <hr className={'mt-1 m-0 p-0'}/>
                            <div className={'fs-7'}>
                                <b>Посл. комментарий:</b>
                                <div className={'fs-7'}>
                                    {card.last_comment.comment}
                                </div>
                            </div>
                        </>
                    }

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
                         overflowY: 'auto',
                         overflowX: 'auto',
                         minWidth: '90px',
                         lineHeight: '12px'
                     }}
                >
                    Создал:<br/>
                    <b className={'text-nowrap'}>{getNameById(card.created_by, 'short')}</b>
                    <br/>
                    Исполнитель:<br/>
                    <b className={'text-nowrap'}>{getNameById(card.new_executor?.employee, 'short')}</b>
                    <br/>
                    Соисполнит.:<br/>
                    {card.new_co_executors?.map(co_executor => (
                        <b className={'text-nowrap'} key={co_executor.id}>
                            {getNameById(co_executor.employee, 'short')}
                            <br/>
                        </b>
                    ))}
                </div>

                {!hideSecondBtn &&
                    <TaskBtn
                        first={false}
                        card={card}
                        cardType={cardType}
                    />
                }

            </div>
        </div>
    )
        ;
});
