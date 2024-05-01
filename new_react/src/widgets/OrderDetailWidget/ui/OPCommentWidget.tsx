import {useState} from "react";
import {Button, Form} from "react-bootstrap";

import {useAppDispatch} from "@shared/hooks";
import {fetchAddComment} from "@widgets/OrderDetailWidget/model/api/fetchAddComment";


interface OpCommentWidgetProps {
    series_id: string;
}


export const OpCommentWidget = (props: OpCommentWidgetProps) => {
    const dispatch = useAppDispatch();

    const [comment, setComment] = useState("");

    const addComment = () => {
        if (comment) {
            dispatch(fetchAddComment({
                series_id: props.series_id,
                comment: comment,
            })).then(() => setComment(""))
        }
    }


    return (
        <div>
            <Form.Control
                as="input"
                placeholder="Комментарий"
                className={'my-2'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <Button size={"sm"} className={'mb-2'} disabled={!comment} variant={'dark'} onClick={addComment}>
                Оставить комментарий
            </Button>
        </div>
    );
};
