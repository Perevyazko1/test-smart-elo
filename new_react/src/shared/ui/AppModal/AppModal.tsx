import {ReactNode, useEffect} from "react";

import cls from './AppModal.module.scss';


interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}


export const AppModal = (props: AppModalProps) => {
    const {isOpen, onClose, children} = props;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className={`${isOpen && cls.modalActive} ${cls.modalBackdrop}`}
            onClick={onClose}
        >
            <div
                className={`${isOpen && cls.modalContentActive} ${cls.modalContent}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className={cls.modalBtn} onClick={onClose}>
                    <i className="fas fa-times mx-xl-3 fs-3 text-black"/>
                </button>

                {children}
            </div>
        </div>
    );
};
