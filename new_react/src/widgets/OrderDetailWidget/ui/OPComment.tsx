import {OpComment} from "../model/types"
import {getHumansDatetime} from "@shared/lib";
import {useAppDispatch, useCurrentUser} from "@shared/hooks";
import {useMemo} from "react";
import {Button} from "react-bootstrap";
import {fetchEditComment} from "@widgets/OrderDetailWidget/model/api/fetchEditComment";


interface OPCommentProps {
    comment: OpComment;
}

export const OpCommentRow = (props: OPCommentProps) => {
    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();

    const getCommentFormatedText = (comment: OpComment) => {
        return `${comment.author.last_name} ${comment.author.first_name?.slice(0, 1)}. 
        ${getHumansDatetime(comment.add_date)}: ${comment.text}`
    }

    const isOwner = useMemo(() => props.comment.author.id === currentUser.id,
        [currentUser.id, props.comment.author.id]
    )

    const DeleteBtn = () => {
        return (
            <Button
                size={'sm'}
                className={"m-0 me-1 p-0"}
                variant={"outline-danger"}
                onClick={() => editCommentClb(
                    props.comment.deleted ? "-delete" : "delete"
                )}
            >
                {props.comment.deleted ?
                    <i className="fas fa-outdent mx-xl-3"/>
                    :
                    <i className="fas fa-times mx-xl-2"/>
                }
            </Button>
        )
    }

    const editCommentClb = (action: "delete" | "-delete" | "important" | "-important") => {
        dispatch(fetchEditComment({
            action: action,
            comment_id: props.comment.id,
            op_id: props.comment.order_product,
        }))

    }

    const ImportantBtn = () => {
        return (
            <Button
                size={'sm'}
                className={"m-0 me-1 p-0"}
                variant={"outline-dark"}
                onClick={() => editCommentClb(
                    props.comment.important ? "-important" : "important"
                )}
            >
                {props.comment.important ?
                    <i className="fas fa-star mx-xl-3"/>
                    :
                    <i className="far fa-star mx-xl-1"/>
                }
            </Button>
        )
    }

    return (
        <div>
            <p className={
                `m-1 p-0 ${props.comment.important ? "fw-bold" : ""} ${props.comment.deleted ? " text-decoration-line-through" : ""}`
            }>
                {isOwner &&
                    <>
                        <DeleteBtn/>
                        <ImportantBtn/>
                    </>
                }
                {getCommentFormatedText(props.comment)}
            </p>
            <hr className={'m-1 p-0'}/>
        </div>
    );
};
