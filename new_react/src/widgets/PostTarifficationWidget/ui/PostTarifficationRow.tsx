import {TarifficationAssignments} from "@widgets/PostTarifficationWidget/model/types";
import {getHumansDatetime} from "@shared/lib";
import {useEmployeeName} from "@shared/hooks";

interface PostTarifficationRowProps {
    assignment: TarifficationAssignments;
    onCheck: (id: number) => void;
    checked: boolean;
    proposedTariff: number;
    disabled: boolean;
}


export const PostTarifficationRow = (props: PostTarifficationRowProps) => {
    const {assignment, proposedTariff} = props;
    const {getNameById} = useEmployeeName();
    return (
        <tr>
            <td>
                <input
                    disabled={props.disabled}
                    className="form-check-input"
                    type="checkbox"
                    checked={props.checked}
                    onChange={() => props.onCheck(assignment.id)}
                />
            </td>
            <td className={'fs-7'}>{assignment.number}</td>
            <td className={'fs-7'}>{assignment.department.name}</td>
            <td className={'fs-7'}>
                {props.checked
                    ? <div className={'fw-bold'}>{proposedTariff.toLocaleString('ru-RU')}</div>
                    : <>0</>
                }
            </td>
            <td className={'fs-7'}>{assignment.order_number}</td>
            <td className={'fs-7'}>{assignment.project}</td>
            <td className={'fs-7'}>{getNameById(assignment.executor, 'listNameInitials')}</td>
            <td className={'fs-7'}>{assignment.status}</td>
            <td className={'fs-7'}>{getHumansDatetime(assignment.appointment_date)}</td>
            <td className={'fs-7'}>{getHumansDatetime(assignment.date_completion)}</td>
            <td className={'fs-7'}>{getNameById(assignment.inspector, 'listNameInitials')}</td>
            <td className={'fs-7'}>{getHumansDatetime(assignment.inspect_date)}</td>
        </tr>
    );
};
