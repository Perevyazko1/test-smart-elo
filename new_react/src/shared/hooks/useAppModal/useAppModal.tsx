import {useContext} from "react";
import {ModalContext, ModalContextProps} from "@app";


export const useAppModal = (): ModalContextProps => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useAppModal must be used within a ModalProvider");
    }
    return context;
};