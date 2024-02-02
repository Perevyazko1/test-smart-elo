import {APP_PERM} from "@shared/consts";
import {useCurrentUser} from "@shared/hooks";

export const usePermission = (permission: APP_PERM): boolean => {
  const {currentUser} = useCurrentUser();
  return currentUser?.groups.some(group => group.name === permission) ?? false;
}