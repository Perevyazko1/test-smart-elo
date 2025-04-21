import {ModalContext, ModalContextProps} from "@/app/providers";
import {useContext} from "react";


export const useModal = (): ModalContextProps => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useAppModal must be used within a ModalProvider");
    }
    return context;
};