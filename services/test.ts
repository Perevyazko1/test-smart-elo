// Акцесс в локал сторе, рефреш в куки httpOnly
// Рефрешим тут: /refresh
// Чек акцеса тут: /protected
interface IToken {
    access_token: string;
    refresh_token: string;
    token_type: "bearer";
}

interface IPermission {
    id: string;
    name: string;
    description: string;
}

interface ICreatePermission extends Omit<IPermission, 'id'> {
}

interface IRole {
    id: string;
    name: string;
    permissions: IPermission[];
    description: string;
}

interface ICreateRole extends Omit<IRole, 'id' | 'permissions'> {
    permissions: string[];
}

interface IUser {
    id: string;
    name_legal?: string;
    name_short?: string;
    name_full?: string;
    email?: string;
    phone: string;
    description?: string;
    roles: IRole[];
    is_active: boolean;
    created_at: string;
    updated_at: string;

    // поле только для БД
    hashed_password: string;
}

interface ICreateUser extends Omit<IUser, 'id'> {
    password: string;
    confirm_password: string;
}

interface IUpdateUser extends Partial<Omit<IUser, 'id' | 'roles'>> {
    roles?: string[];
}

// Только для БД
interface IRefreshToken {
    id: string;
    user_id: string;
    token: string;

    created_at: string;
    expires_at: string;

    // Отозван вручную
    revoked: boolean;

    // Данные о браузере
    user_agent: string;
    ip_address: string;
}

interface IAddress {
    id: string;
    index: string;
    street: string;
    house: string;
    flat: string;
    building: string;
    entrance: string;
    floor: string;
    apartment: string;
    comment: string;
    is_active: boolean;
}

interface IShelter {
    id: string;
    name: string;
    description?: string;
    address?: IAddress;
    admins: IUser[];
    is_active: boolean;
    phone: string;
    email?: string;
    website?: string;
    created_at: string;
    updated_at: string;
}

interface ICreateShelter extends Omit<IShelter, 'id' | 'admins'> {
    admins: string[];
}

interface IImage {
    id: string;
    url: string;
    // Миниатюра будет сама делаться на сервере
    thumbnail_url: string;
    description?: string;
    is_active: boolean;
}

interface ICreateImage extends Omit<IImage, 'id' | 'thumbnail_url'> {
}

interface IAnimal {
    id: string;
    name: string;
    species: string;
    breed: string;
    description?: string;
    shelter: IShelter;
    images: IImage[];
}

interface ICreateAnimal extends Omit<IAnimal, 'id'> {
}

