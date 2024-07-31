import {createContext, ReactNode, useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";

import {Box, Modal} from "@mui/material";
import cls from "./AppModal.module.scss";


const style = {
    position: 'relative' as 'relative',
    bgcolor: 'background.paper',
    border: '2px solid #000',
};

interface ModalState {
    content: ReactNode;
    confirmClose: boolean;
}

export interface ModalContextProps {
    handleOpen: (content: ReactNode, confirmClose?: boolean) => void;
    handleClose: () => void;
}


export const ModalContext = createContext<ModalContextProps | undefined>(undefined);


export const ModalProvider = (props: { children: ReactNode }) => {
    const [modals, setModals] = useState<ModalState[]>([]);
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        let root = document.getElementById('modal-root');
        if (!root) {
            root = document.createElement('div');
            root.setAttribute('id', 'modal-root');
            document.body.appendChild(root);
        }
        setModalRoot(root);

        return () => {
            if (root && root.parentNode) {
                root.parentNode.removeChild(root);
            }
        };
    }, []);

    const handleOpen = (content: ReactNode, confirmClose = false) => {
        setModals(prevModals => [...prevModals, {content, confirmClose}]);
    };

    const handleClose = useCallback(() => {
        setModals(prevModals => {
            if (prevModals.length === 0) return prevModals;

            const {confirmClose} = prevModals[prevModals.length - 1];
            if (confirmClose) {
                const userConfirmed = window.confirm("Вы уверены, что хотите закрыть окно?");
                if (!userConfirmed) return prevModals;
            }

            return prevModals.slice(0, -1);
        });
    }, []);

    const value = {handleOpen, handleClose};

    return (
        <ModalContext.Provider value={value}>
            {props.children}
            {modalRoot && modals.length > 0 && createPortal(
                <Modal
                    open={true}
                    onClose={handleClose}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "self-start"
                    }}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={style}>
                        <button className={cls.modalBtn} onClick={handleClose}>
                            <i className="fas fa-times mx-xl-3 fs-3 text-black"/>
                        </button>
                        <div
                            className={'p-md-2 p-sm-1 p-4 m-1 d-flex'}
                            style={{
                                height: '100%',
                                overflowX: 'hidden',
                                overflowY: 'auto',
                                minWidth: '25dvw',
                                minHeight: '25dvh',
                                maxWidth: '100dvw',
                                maxHeight: '100dvh',
                            }}
                        >
                            {modals[modals.length - 1].content}
                        </div>
                    </Box>
                </Modal>,
                modalRoot
            )}
        </ModalContext.Provider>
    );
};

