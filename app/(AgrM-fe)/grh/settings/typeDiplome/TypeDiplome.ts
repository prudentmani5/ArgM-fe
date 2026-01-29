export class TypeDiplome {
    typeDiplomeId: string = '';
    diplome: string = '';

    constructor(init?: Partial<TypeDiplome>) {
        Object.assign(this, init);
    }
}
