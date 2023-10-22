declare interface Array<T> {
    removeIf(callback: (item: T, index: number) => boolean): Array<T>;
    groupBy<T, K extends keyof any>(getKey: (item: T) => K): Record<K, T[]>;
}