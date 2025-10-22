import {useQuery} from '@tanstack/react-query'
import {$axios} from '@/shared/api'
import type {IDepartment} from '@/entities/department'


export const useDepartments = () => {
    return useQuery<IDepartment[]>({
        queryKey: ['departments'],
        queryFn: async () => {
            const res = await $axios.get<IDepartment[]>('/staff/departments')
            return res.data
        },
        staleTime: 1000 * 60 * 5, // 5 минут кэш живой
    })
}