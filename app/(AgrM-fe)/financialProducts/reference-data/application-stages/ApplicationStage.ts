export class ApplicationStage {
    id?: number;
    code: string;
    name: string;
    nameFr: string;
    stageNumber: number;
    description?: string;
    descriptionFr?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    constructor() {
        this.code = '';
        this.name = '';
        this.nameFr = '';
        this.stageNumber = 1;
        this.isActive = true;
    }
}
