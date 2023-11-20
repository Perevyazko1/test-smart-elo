import {createContext, ReactNode, useState} from "react";
import {AppModal} from "@shared/ui";

interface ModalContextType {
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = (props: { children: ReactNode }) => {
    const [modalContent, setModalContent] = useState<ReactNode>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (content: ReactNode) => {
        setModalContent(content);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setModalContent(null), 400)
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {props.children}
            <AppModal isOpen={isOpen} onClose={closeModal}>
                {modalContent}
            </AppModal>
        </ModalContext.Provider>
    );
};

