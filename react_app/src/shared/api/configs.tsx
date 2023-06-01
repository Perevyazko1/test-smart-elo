export const getPaginationSize = (windowHeight: number = 1000, elementSize: number = 120, kView: number = 1.3) => {
    return Math.trunc(windowHeight / elementSize * kView)
}