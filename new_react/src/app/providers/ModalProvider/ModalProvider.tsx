import {createContext, ReactNode, useState} from "react";
import {AppModal} from "@shared/ui";

interface ModalContextType {
    openModal: (props: {content: ReactNode, confirmClose?: boolean}) => void;
    closeModal: () => void;
    confirmClose?: boolean;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = (props: { children: ReactNode }) => {
    const [modalContent, setModalContent] = useState<ReactNode>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [confirmClose, setConfirmClose] = useState(false);

    const openModal = (props: {content: ReactNode, confirmClose?: boolean}) => {
        const {content, confirmClose = false} = props;
        setModalContent(content);
        setIsOpen(true);
        setConfirmClose(confirmClose);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setModalContent(null), 400)
    };

    return (
        <ModalContext.Provider value={{openModal, closeModal}}>
            {props.children}
            <AppModal isOpen={isOpen} onClose={closeModal} confirmClose={confirmClose}>
                {modalContent}
            </AppModal>
        </ModalContext.Provider>
    );
};

