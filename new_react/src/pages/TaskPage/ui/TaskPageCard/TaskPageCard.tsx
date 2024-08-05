import {HTMLAttributes, memo, useMemo} from "react";

import cls from "../TaskPage.module.scss";

import {getViewModeText, TaskStatus} from "@pages/TaskPage";
import {AppSlider} from "@shared/ui";
import {useAppModal, useCurrentUser} from "@shared/hooks";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";
import {TaskForm} from "@widgets/TaskForm";

import {Task} from "../../model/types";
import {TaskBtn} from "./ui/TaskBtn";

interface TaskPageCardProps extends HTMLAttributes<HTMLDivElement> {
    card: Task;
    cardType: TaskStatus;
}

export const TaskPageCard = memo((props: TaskPageCardProps) => {
    const {card, cardType, ...otherProps} = props;
    const {currentUser} = useCurrentUser();

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
        )
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
        return card.created_by?.id !== currentUser.id;
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

    return (
        <div style={{padding: ".1rem", maxWidth: '1300px'}} {...otherProps}>
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
                    <TaskBtn
                        first={true}
                        card={card}
                        cardType={cardType}
                    />
                }

                <div className={cls.sliderBlock + ' bg-light rounded'}
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
                    />
                </div>

                <div className={'bg-light rounded ' + cls.textBlock}>
                    № {card.id} {card.title}
                    <hr className={'m-0 p-0'}/>
                    <div className={'fs-7'}>
                        {card.description}
                    </div>
                    {card.execution_comment &&
                        <>
                            <hr className={'m-0 p-0'}/>
                            <div className={'fs-7'}>
                                <b>Результат:</b> {card.execution_comment}
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
                    <b className={'text-nowrap'}>{getEmployeeName(card.created_by, 'short')}</b>
                    <br/>
                    Исполнитель:<br/>
                    <b className={'text-nowrap'}>{getEmployeeName(card.executor, 'short')}</b>
                    <br/>
                    Соисполнит.:<br/>
                    {card.co_executors?.map(user => (
                        <b className={'text-nowrap'} key={user.id}>
                            {getEmployeeName(user, 'short')}
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
