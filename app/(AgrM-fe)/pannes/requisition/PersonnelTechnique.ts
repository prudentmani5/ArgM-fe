// app/(gps-fe)/pannes/requisition/PersonnelTechnique.ts
export interface PersonnelTechnique {
    matricule: string;
    nom: string;
    prenom: string;
    salaireHoraire: number;
}

export const initialPersonnelTechnique: PersonnelTechnique = {
    matricule: '',
    nom: '',
    prenom: '',
    salaireHoraire: 0
};