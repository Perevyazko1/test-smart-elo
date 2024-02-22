export const errorApiHandler = (error: any) => {
    const serverError = error as {response?: { data?: { error?: string } }}
    console.error(serverError)
    alert(
        serverError.response?.data?.error
        ||
        `Непредвиденная ошибка, обратитесь к администратору. Код ошибки ${error}`
    )
}