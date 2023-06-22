import {eqPageCardEntityAdapter} from "entities/EqPageCard";
import {StateSchema} from "app/providers/StoreProvider";

export const getEqAwaitList = eqPageCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqMobile?.cardList.results || eqPageCardEntityAdapter.getInitialState()
);
