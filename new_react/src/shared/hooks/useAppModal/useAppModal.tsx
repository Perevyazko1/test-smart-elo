import {useContext} from "react";
import {ModalContext} from "@app";


export const useAppModal = () => {
    const appModal = useContext(ModalContext);

    if (!appModal) {
        throw new Error("SomeComponent must be used within a ModalContext.Provider");
    }

    return appModal;
};