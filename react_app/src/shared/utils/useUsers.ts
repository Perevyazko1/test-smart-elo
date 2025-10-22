import {$axios} from "@/shared/api";
import {useQuery} from "@tanstack/react-query";
import type {IDepartment} from "@/entities/department";
import type {IUser} from "@/entities/user";


export const useUsers = () => {
    return useQuery<IUser[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await $axios.get<IUser[]>('/staff/employees')
            return res.data
        },
        staleTime: 1000 * 60 * 5, // 5 минут кэш живой
    })
}
