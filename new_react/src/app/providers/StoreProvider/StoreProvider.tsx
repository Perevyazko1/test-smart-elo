import {ReactNode} from "react";
import {Provider} from "react-redux";
import {StateSchema} from "./stateSchema";
import {createReduxStore} from "./store";

interface StoreProviderProps {
    children?: ReactNode;
    initialState?: StateSchema;
}

export const StoreProvider = (props: StoreProviderProps) => {
    const {
        children
    } = props;

    const store = createReduxStore();

    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}