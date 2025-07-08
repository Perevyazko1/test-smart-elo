import type {SalaryUserInfo} from "@/entities/salary";
import {TextArea} from "@/shared/ui/textarea/TextArea.tsx";
import {Btn} from "@/shared/ui/Buttons/Btn.tsx";


interface PayrollUserInfoProps {
    userInfo: SalaryUserInfo;
    setSelectedUserId: (arg: number) => void;
}

export const PayrollUserInfo = (props: PayrollUserInfoProps) => {
    const {userInfo, setSelectedUserId} = props;

    return (
        <tr>
            <td className="py-2 px-4 border border-gray-300"

            >
                <Btn
                    bg={'white'}
                    onClick={() => setSelectedUserId(userInfo.id)}
                >
                    {userInfo.name}
                </Btn>
            </td>
            <td className="py-2 px-4 border border-gray-300">
                {userInfo.balanceSum}
            </td>
            <td className="py-2 px-4 border border-gray-300 text-center">
                {userInfo.earnedSum}
            </td>
            <td className="py-2 px-4 border border-gray-300 text-center">
                {userInfo.issuedSum}
            </td>
            <td className="py-2 px-4 border border-gray-300">
                {userInfo.cardSum}
            </td>
            <td className="py-2 px-4 border border-gray-300">
                {userInfo.taxSum}
            </td>
            <td className="border border-gray-300 bg-yellow-100">
                <div className={'flex items-center h-full text-[0.8em]'}>
                    <TextArea
                        className={'px-2 resize-none w-full'}
                        defaultValue={userInfo.comment}
                    />
                </div>
            </td>

        </tr>
    );
};