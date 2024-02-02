export { ModalProvider } from "./providers/ModalProvider/ModalProvider";

export {ModalContext} from "@app/providers/ModalProvider/ModalProvider";
export {StoreProvider} from "./providers/StoreProvider/StoreProvider";
export {App} from './ui/App';
export {
    IsDesktopContext, CurrentUserContext, AppInCompactMode, ContextProvider, IsLoadingContext
} from './providers/ContextProvider/ContextProvider';
export type {AppDispatch} from './providers/StoreProvider/store';
export type {StateSchema, StateSchemaKey, ReduxStoreWithManager, ThunkConfig} from './providers/StoreProvider/stateSchema';
