import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {CombinedState} from "redux";
import {StateSchema} from "app/providers/StoreProvider";

export const useAppSelector: TypedUseSelectorHook<CombinedState<StateSchema>> = useSelector;
