import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {CombinedState} from "redux";
import {StateSchema} from "@app";

export const useAppSelector: TypedUseSelectorHook<CombinedState<StateSchema>> = useSelector;
