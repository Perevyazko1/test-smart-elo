"use client"
import {createContext, ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import cn from 'clsx'


interface ModalState {
    content: ReactNode;
    title: ReactNode;
    confirmClose?: boolean;
}

export interface ModalContextProps {
    handleOpen: (props: ModalState) => void;
    handleClose: () => void;
    closeNoConfirm: () => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(undefined);


export const ModalProvider = (props: { children: ReactNode }) => {
    const [modals, setModals] = useState<ModalState[]>([]);
    const [showContent, setShowContent] = useState<boolean>(false);
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let root = document.getElementById('modal-root');

            if (!root) {
                root = document.createElement('div');
                root.setAttribute('id', 'modal-root');
                document.body.appendChild(root);
            }
            if (modals.length > 0) {
                document.body.style.overflow = "hidden";
                // document.body.style.paddingRight = "1rem";
            } else {
                document.body.style.overflow = "";
                // document.body.style.paddingRight = "";
            }
            setModalRoot(root);
        }
    }, [modals.length]);

    const handleOpen = (props: ModalState) => {
        setShowContent(false);
        setModals(prevModals => [...prevModals, props]);
    };

    useEffect(() => {
        setTimeout(() => {
            setShowContent(true);
        }, modals.length === 1 ? 30 : 300)
    }, [modals.length])

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => {
            setModals(prevModals => {
                if (prevModals.length === 0) return prevModals;

                const {confirmClose} = prevModals[prevModals.length - 1];
                if (confirmClose) {
                    const userConfirmed = window.confirm("Вы уверены, что хотите закрыть окно?");
                    if (!userConfirmed) return prevModals;
                }
                setShowContent(true);
                return prevModals.slice(0, -1);
            });
        }, 300)
    };

    const closeNoConfirm = () => {
        setTimeout(() => {
            setModals(prevModals => {
                if (prevModals.length === 0) return prevModals;
                setShowContent(true);
                return prevModals.slice(0, -1);
            });
        }, 300)
        setShowContent(false);
    };

    const value = {handleOpen, handleClose, closeNoConfirm};

    return (
        <ModalContext.Provider value={value}>
            {props.children}

            {modalRoot && modals.length > 0 && createPortal(
                <div className="relative z-[60]"
                     aria-labelledby="slide-over-title"
                     role="dialog"
                     aria-modal="true"
                >
                    <div
                        className="fixed inset-0 bg-b_9B/50 transition-opacity cursor-close backdrop-blur-sm"
                        aria-hidden="true"
                        onClick={handleClose}
                    ></div>

                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                        <div className="pointer-events-auto relative w-screen max-w-md">
                            <div
                                id={'modal-content'}
                                className={cn(
                                    'flex h-full flex-col bg-white py-[10] shadow-sm relative thinYScroll transition-all',
                                    {
                                        'active': showContent,
                                        '': !showContent,
                                    }
                                )}
                            >
                                <div
                                    className={'flex justify-between gap-[20] flex-nowrap align-items-center mb-[10] px-[10]'}>
                                    <span className={'flex h-full items-center text-xl'}>
                                        {modals[modals.length - 1].title}
                                    </span>

                                    <button onClick={closeNoConfirm}
                                            type={"button"}
                                            className={"cursor-pointer z-[80] p-[15] border-2"}
                                    >
                                        ❌
                                    </button>
                                </div>

                                <div className="relative px-[10]">
                                    {modals[modals.length - 1].content}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ,
                modalRoot
            )}
        </ModalContext.Provider>
    );
};

