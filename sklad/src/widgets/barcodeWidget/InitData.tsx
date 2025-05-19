import {useQuery} from "@tanstack/react-query";
import {getOrganization, getStore} from "@/api/lossApi";
import {useEffect, useState} from "react";

interface Props {
    inited: boolean;
    setInited: (value: boolean) => void;
}


export const InitData = (props: Props) => {
    const {inited, setInited} = props;
    const [hasStoredData, setHasStoredData] = useState<boolean>(false);

    useEffect(() => {
        // if (!!localStorage.getItem('organization') && !!localStorage.getItem('store')) {
        //     setHasStoredData(true);
        // }
        setInited(true)
    }, [setInited]);

    const {data: store, isLoading: storeIsLoading, error: storeError} = useQuery({
        queryKey: ['store', {param: "all"}],
        queryFn: getStore,
        enabled: inited && !hasStoredData,
    });

    const {data: organization, isLoading: organizationIsLoading, error: organizationError} = useQuery({
        queryKey: ['organization', {param: "all"}],
        queryFn: getOrganization,
        enabled: inited && !hasStoredData,
    });

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

    if (storeIsLoading || !inited) return <span>Loading...</span>;
    if (storeError) return <span>Error!</span>;
    if (!store) return <span>Неудачный запрос</span>;

    if (organizationIsLoading || !inited) return <span>Loading...</span>;
    if (organizationError) return <span>Error!</span>;
    if (!organization) return <span>Неудачный запрос</span>;

    if (store) {
        localStorage.setItem('organization', JSON.stringify(organization));
        localStorage.setItem('store', JSON.stringify(store));
        setHasStoredData(true);
    }

    return <span>✅</span>;
};