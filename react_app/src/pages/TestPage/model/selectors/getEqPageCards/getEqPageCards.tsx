import {StateSchema} from "app/providers/StoreProvider";
import {eqPageCardEntityAdapter} from "entities/EqPageCard";

export const getEqPageCards = eqPageCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqPage?.results || eqPageCardEntityAdapter.getInitialState());