import type {IUser} from "@/entities/user";



export const getUserName = (user: IUser | null) => {
    if (!user) {return "-"}
    return (user.first_name || "") + ' ' + (user.last_name || "");
}