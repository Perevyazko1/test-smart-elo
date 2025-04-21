import {useQuery} from "@tanstack/react-query";
import {getLossList} from "@/api/lossApi";
import {useEffect, useState} from "react";

interface Props {
    inited: boolean;
    setInited: (value: boolean) => void;
}


export const InitData = (props: Props) => {
    const {inited, setInited} = props;
    const [hasStoredData, setHasStoredData] = useState<boolean>(false);

    useEffect(() => {
        if (!!localStorage.getItem('organization') && !!localStorage.getItem('store')) {
            setHasStoredData(true);
        }
        setInited(true)
    }, [setInited]);

    const {data, isLoading, error} = useQuery({
        queryKey: ['lossList', {param: "all"}],
        queryFn: getLossList,
        enabled: inited && !hasStoredData,
    });

    const getPosition = () => {
        if (data && data.rows.length > 0) {
            return data.rows[0];
        }
    };
    const clearHandle = () => {
        localStorage.removeItem('organization');
        localStorage.removeItem('store');
        setHasStoredData(false);
    }

    if (hasStoredData) {
        return (
            <span onClick={clearHandle}>
                ✅
            </span>
        )
    }

    const position = getPosition();
    if (isLoading || !inited) return <span>Loading...</span>;
    if (error) return <span>Error!</span>;
    if (!position) return <span>Неудачный запрос</span>;

    if (position) {
        localStorage.setItem('organization', JSON.stringify(position.organization));
        localStorage.setItem('store', JSON.stringify(position.store));
        setHasStoredData(true);
    }

    return <span>✅</span>;
};