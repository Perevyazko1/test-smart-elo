import {AppSkeleton, AppVoiceInput} from "@shared/ui";


import {useGetTarifficationComments, useCreateTarifficationComment} from "../model/api";
import {getHumansDatetime} from "@shared/lib";
import {useCurrentUser, useEmployeeName} from "@shared/hooks";
import {useState} from "react";


interface TarifficationCommentsProps {
    productionStepId: number;
}

export const TarifficationComments = (props: TarifficationCommentsProps) => {
    const {productionStepId} = props;

    const {getNameById} = useEmployeeName();
    const {currentUser} = useCurrentUser();
    const [inputValue, setInputValue] = useState('');

    const {data, isLoading} = useGetTarifficationComments({production_step: productionStepId});
    const [createNewComment, {isLoading: isCreating}] = useCreateTarifficationComment();


    const submitHandle = () => {
        createNewComment({
            author: currentUser.id,
            production_step: productionStepId,
            comment: inputValue,
        }).then(
            () => setInputValue("")
        );
    };

    return (
        <div className={'p-2 d-flex flex-column gap-3'}>
            <AppVoiceInput
                disabled={isCreating}
                label={'Комментарий'}
                value={inputValue}
                setValue={setInputValue}
                onSubmit={submitHandle}
            />

            {(isLoading || isCreating) && <AppSkeleton className={'w-100 flex-fill'} style={{height: '17px'}}/>}

            {data?.map(comment => (
                <div key={comment.id} className={'fs-7'} style={{height: '17px'}}>
                    {getHumansDatetime(comment.add_date)} | {getNameById(comment.author, 'listNameInitials')} -
                    <b className={'ms-3'}>{comment.comment}</b>
                    <hr className={'m-0 p-0 w-50'}/>
                </div>
            ))}
        </div>
    );
};
