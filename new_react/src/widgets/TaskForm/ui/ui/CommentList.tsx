import {useTaskCommentList} from "@widgets/TaskForm/model/api";
import {getHumansDatetime} from "@shared/lib";
import {AppSkeleton} from "@shared/ui";
import {useEmployeeName} from "@shared/hooks";


interface CommentListProps {
    taskId: number;
}


export const CommentList = (props: CommentListProps) => {
    const {taskId} = props;

    const {getNameById} = useEmployeeName();

    const {data: comments, isLoading: commentsIsLoading} = useTaskCommentList({task: taskId});

    const RowSkeleton = <AppSkeleton className={'w-100 flex-fill m-1'} style={{height: '15px'}}/>

    return (
        <div className={'w-100 fs-7 p-1 ps-3'}>
            {commentsIsLoading &&
                <div className={'d-flex flex-column flex-fill'}>
                    {RowSkeleton}
                    {RowSkeleton}
                    {RowSkeleton}
                </div>
            }
            {comments &&
                <>
                    {comments.length > 0 ?
                        comments.map(comment => (
                            <div key={comment.id} className={'fs-7'}>
                                {getHumansDatetime(comment.add_date)} | {getNameById(comment.author, 'listNameInitials')} -
                                <b className={'ms-3'}>{comment.comment}</b>
                                <hr className={'m-0 p-1 w-50'}/>
                            </div>
                        ))
                        :
                        <div>
                            Нет комментариев
                            <hr className={'m-0 p-1 w-50'}/>
                        </div>
                    }
                </>
            }
        </div>
    );
};
