import {Spinner} from "react-bootstrap";

import {useAppSelector} from "@shared/hooks";


import {getPageIsLoading} from "../../model/selectors";

export const BodyHeader = () => {
    const isLoading = useAppSelector(getPageIsLoading);

    return (
        <div>
            <div className="d-flex align-items-center p-2 pb-1">
                <h4 className={'m-0'}>
                    ЭЛО Сделка
                    {isLoading && <Spinner animation={'grow'} size={'sm'}/>}
                </h4>
            </div>
            <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
        </div>
    );
};
