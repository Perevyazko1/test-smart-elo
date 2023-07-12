import {eqPageCardEntityAdapter} from "entities/EqPageCard";
import {StateSchema} from "app/providers/StoreProvider";

export const getEqAwaitList = eqPageCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqDesktop?.awaitList.results || eqPageCardEntityAdapter.getInitialState()
);

export const getEqInWorkList = eqPageCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqDesktop?.inWorkList.results || eqPageCardEntityAdapter.getInitialState()
);

export const getEqReadyList = eqPageCardEntityAdapter.getSelectors<StateSchema>(
    state => state.eqDesktop?.readyList.results || eqPageCardEntityAdapter.getInitialState()
);

