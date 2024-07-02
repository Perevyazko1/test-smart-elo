import {ReactNode, useCallback, useEffect} from "react";

import cls from './AppModal.module.scss';


interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    confirmClose?: boolean;
}


export const AppModal = (props: AppModalProps) => {
    const {isOpen, onClose, children, confirmClose = false} = props;

    const closeClb = useCallback(() => {
        if (confirmClose) {
            if (window.confirm('Закрыть модальное окно?')) {
                onClose();
            }
        } else {
            onClose();
        }
    }, [confirmClose, onClose]);

    useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    closeClb()
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [closeClb, confirmClose, onClose]
    );


    return (
        <div
            className={`${isOpen && cls.modalActive} ${cls.modalBackdrop}`}
            onClick={closeClb}
        >
            <div
                className={`${isOpen && cls.modalContentActive} ${cls.modalContent}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className={cls.modalBtn} onClick={closeClb}>
                    <i className="fas fa-times mx-xl-3 fs-3 text-black"/>
                </button>

                <div className={'p-3'} style={{overflowY: 'auto', overflowX: 'hidden', maxHeight: '100dvh'}}>
                    {children}
                </div>
            </div>
        </div>
    );
};
