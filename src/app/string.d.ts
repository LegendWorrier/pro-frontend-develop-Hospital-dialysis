declare interface String {
    format(...replacements: string[]): string;
    capitalizeFirstLetter(): string;
    removeProtocol(): string;
}