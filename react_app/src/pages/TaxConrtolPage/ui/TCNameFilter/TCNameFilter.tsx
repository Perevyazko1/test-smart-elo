import React, {memo, ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useDebounce} from "shared/lib/hooks/useDebounce/useDebounce";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {taxControlActions} from "../../model/slice/taxControlPageSlice";
import {useSelector} from "react-redux";
import {getTCProductNameFilter} from "../../model/selectors/getTCProductNameFilter/getTCProductNameFilter";

interface TCNameFilterProps {
    className?: string
    children?: ReactNode
}


export const TCNameFilter = memo((props: TCNameFilterProps) => {
    const {
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const current_product_name_filter = useSelector(getTCProductNameFilter)
    const [input_value, setInputValue] = useState('')

    const mods: Mods = {};

    useEffect(() => {
        if (current_product_name_filter === "") {
            setInputValue('')
        }
    }, [current_product_name_filter])

    const set_product_name_filter = useCallback ((name: string) => {
        dispatch(taxControlActions.setProductNameFilter(name))
    }, [dispatch])

    const debouncedSetProductNameFilter = useDebounce(
        set_product_name_filter,
        500
    )

    useEffect(() => {
        debouncedSetProductNameFilter(input_value);
    }, [input_value]);

    return (
        <input placeholder={'Наименование изделия'}
               className={classNames('form-control form-control-sm my-auto', mods, [className])}
               onChange={(event) => setInputValue(event.target.value)}
               value={input_value}
               {...otherProps}
        />
    );
});