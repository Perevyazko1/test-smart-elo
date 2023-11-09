import {ReactNode, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {Reducer} from '@reduxjs/toolkit';
import {ReduxStoreWithManager, StateSchemaKey} from "@app";

export type ReducersList = {
    [name in StateSchemaKey]?: Reducer;
}

interface DynamicComponentProps {
    children: ReactNode;
    reducers: ReducersList;
    removeAfterUnmount?: boolean;
}

export const DynamicComponent = (props: DynamicComponentProps) => {
    const {
        children,
        reducers,
        removeAfterUnmount = true,
    } = props;

    const store = useStore() as ReduxStoreWithManager;
    const dispatch = useDispatch();

    useEffect(() => {
        const mountedReducers = store.reducerManager.getMountedReducers();

        Object.entries(reducers).forEach(([name, reducer]) => {
            const mounted = mountedReducers[name as StateSchemaKey];
            if (!mounted) {
                store.reducerManager.add(name as StateSchemaKey, reducer);
                dispatch({ type: `@INIT ${name} reducer` });
            }
        });

        return () => {
            if (removeAfterUnmount) {
                Object.entries(reducers).forEach(([name, reducer]) => {
                    store.reducerManager.remove(name as StateSchemaKey);
                    dispatch({ type: `@DESTROY ${name} reducer` });
                });
            }
        };
        // eslint-disable-next-line
    }, []);

    return (
        <>
            {children}
        </>
    );
};
