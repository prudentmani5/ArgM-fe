export class PaieRubrique {
    paramId: number;
    nbrJrsPreste: number;
    tauxInssPensionScPers: number;
    tauxInssPensionSsPers: number;
    tauxInssPensionSCemp: number;
    tauxInssPensionSsEmp: number;
    tauxInssRisqueSCemp: number;
    tauxInssRisqueSsEmp: number;
    tauxMfpEmp: number;
    tauxMfpPers: number;
    tauxLogementSc: number;
    tauxLogementSs: number;
    enfantMontant: number;
    conjointMontant: number;
    nbrPersChargeDeduire: number;
    montantPersChargeDeduire: number;
    tauxIprPlafond: number;
    iprPlafond: number;
    tauxDepla: number;
    tauxDeplaIpr: number;
    plafondBasePension: number;
    plafondBaseRisque: number;
    tauxPensionComplPers: number;
    tauxPensionComplPatr: number;

    constructor() {
        this.paramId = 0;
        this.nbrJrsPreste = 0;
        this.tauxInssPensionScPers = 0;
        this.tauxInssPensionSsPers = 0;
        this.tauxInssPensionSCemp = 0;
        this.tauxInssPensionSsEmp = 0;
        this.tauxInssRisqueSCemp = 0;
        this.tauxInssRisqueSsEmp = 0;
        this.tauxMfpEmp = 0;
        this.tauxMfpPers = 0;
        this.tauxLogementSc = 0;
        this.tauxLogementSs = 0;
        this.enfantMontant = 0;
        this.conjointMontant = 0;
        this.nbrPersChargeDeduire = 0;
        this.montantPersChargeDeduire = 0;
        this.tauxIprPlafond = 0;
        this.iprPlafond = 0;
        this.tauxDepla = 0;
        this.tauxDeplaIpr = 0;
        this.plafondBasePension = 0;
        this.plafondBaseRisque = 0;
        this.tauxPensionComplPers = 0;
        this.tauxPensionComplPatr = 0;
    }
}