import {useContext} from "react";
import {CurrentUserContext} from "@/app/ContextProvider.tsx";


export const useCurrentUser = () => {
    const currentUser = useContext(CurrentUserContext);

    if (!currentUser) {
        throw new Error("SomeComponent must be used within a CurrentUserContext.Provider");
    }

    return currentUser;
}