import {useEffect, useState} from "react";

export const usePagination = (initLimit: number | undefined, count: number | undefined, deps: any[]) => {
    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState(initLimit);
    const [updated, setUpdated] = useState(false);
    const [initial, setInitial] = useState(true);

    useEffect(() => {
        if (!initial) {
            setOffset(0);
            setLimit(initLimit);
            setUpdated(!updated);
        }
        //eslint-disable-next-line
    }, deps);

    useEffect(() => {
        if (count !== undefined && initLimit) {
            setInitial(false)
            if (count > initLimit) {
                setOffset(initLimit);
                setLimit(count - initLimit);
                setUpdated(!updated);
            }
        }
        //eslint-disable-next-line
    }, [count, initLimit]);

    return {offset, limit, updated}
}