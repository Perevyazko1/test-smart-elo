export interface PageProps<T> {
	params: Promise<T> | T | undefined;
}

export type PageIdProp = {params: Promise<{id: string}>}
