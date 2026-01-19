export class FactureType {
    label!: string;
    typeId!: string;

    constructor(label: string, typeId: string) {
        this.label = label;
        this.typeId = typeId;
    }
}