export const prepareFormData = (formTask: object): FormData => {
    const formData = new FormData();
    Object.entries(formTask).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item));
        } else if (value === null) {
            formData.append(key, '');
        } else {
            formData.append(key, value as any);
        }
    });
    return formData;
};