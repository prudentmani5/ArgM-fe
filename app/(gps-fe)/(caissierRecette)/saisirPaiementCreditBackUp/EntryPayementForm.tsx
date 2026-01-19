'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { EntryPayement } from "./entryPayement";
import { Bank } from "./bank";
import { CompteBanque } from "./compteBanque";
import { ImportateurCredit } from "./importateurCredit";
import { Caissier } from "./caissier";
import { Importer } from './importer';

interface EntryPayementProps {
    entryPayement: EntryPayement;
    banks: Bank[];
    compteBanques: CompteBanque[];
    importateurCredits: ImportateurCredit[];
    caissiers: Caissier[];
    importers : Importer[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleSearchInvoice: (rsp: string,sortieId: string) => Promise<void>;
    btnLoading?: boolean;
}


const EntryPayementForm: React.FC<EntryPayementProps> = ({
    entryPayement,
    banks,
    compteBanques,
    importateurCredits,
    caissiers,
    importers,
    handleChange,
    handleDateChange,
    handleNumberChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleSearchInvoice,
    btnLoading = false
}) => {

    const handleSearchClick = async () => {
        if (!entryPayement.factureId && !entryPayement.rsp) {
            // Vous pourriez vouloir afficher une notification ici
            console.error('Veuillez entrer un numéro de facture ou un RSP');
            return;
        }
        await handleSearchInvoice(entryPayement.factureId || '', entryPayement.rsp || '');
    };


    return (

        <div className="card p-fluid">
            <div className="formgrid grid">

                <div className="field col-3">
                    <label htmlFor="type">Type</label>
                    <Dropdown
                        id="type"
                        name="type"
                        value={entryPayement.type}
                        options={[

                            { label: 'Service ou GPS', value: 'Service' },
                            { label: 'RSP', value: 'RSP' },
                            { label: 'Accostage', value: 'Accostage' },

                            { label: 'Chargement café', value: 'ChargCafe' },
                            { label: 'Autres BUCECO', value: 'AutresBUCECO' },
                            { label: 'Accostage', value: 'Accostage' }
                            ,

                            { label: 'Remorquage', value: 'Remorquage' },
                            { label: 'Magasin Acheteur', value: 'MagAcheteur' },
                            { label: 'Dechargement Cafe', value: 'DechargCafe' }
                            ,

                            { label: 'Gardinage Acheteur', value: 'GardAcheteur' },
                            { label: 'Autres', value: 'GardAcheteur' },

                        ]}
                        onChange={(e) => handleDropdownChange('type', e.value)}
                        placeholder="Sélectionnez un type"
                    />
                </div>
                

                <div className="field col-3">
                    <label htmlFor="factureId">Numéro Facture</label>
                        <InputText
                            id="factureId"
                            name="factureId"
                            value={entryPayement.factureId || ''}
                            onChange={handleChange}
                        />
                        
                </div>


               <div className="field col-3">
                    <label htmlFor="rsp">RSP</label>
                    <div className="p-inputgroup">
                        <InputText

                            id="rsp"
                            name="rsp"
                            value={entryPayement.rsp || ''}
                            onChange={handleChange}
                            onBlur={() => {
                                if (entryPayement.rsp) {
                                    handleSearchInvoice(entryPayement.rsp, entryPayement.factureId || '');
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="field col-3">
                    <label htmlFor="modePaiement">Mode de Paiement</label>
                    <Dropdown
                        id="modePaiement"
                        name="modePaiement"
                        value={entryPayement.modePaiement}
                        options={[
                            { label: 'Comptant', value: 'COMPTANT' },
                            { label: 'Crédit', value: 'CREDIT' }
                        ]}
                        onChange={(e) => handleDropdownChange('modePaiement', e.value)}
                        placeholder="Sélectionnez un mode"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="banqueId">Banque</label>
                    <Dropdown
                        id="banqueId"
                        name="banqueId"
                        value={entryPayement.banqueId}
                        options={banks.map(bank => ({
                            label: bank.libelleBanque,
                            value: bank.banqueId
                        }))}
                        onChange={(e) => handleDropdownChange('banqueId', e.value)}
                        placeholder="Sélectionnez une banque"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="compteBanqueId">Compte Banque</label>
                    <Dropdown
                        id="compteBanqueId"
                        name="compteBanqueId"
                        value={entryPayement.compteBanqueId}
                        options={compteBanques.map(compte => ({
                            label: compte.numeroCompte,
                            value: compte.compteBanqueId
                        }))}
                        onChange={(e) => handleDropdownChange('compteBanqueId', e.value)}
                        placeholder="Sélectionnez un compte"
                    />
                </div>

               
                <div className="field col-3">
                    <label htmlFor="clientId">Client</label>
                    <Dropdown
                        id="clientId"
                        name="clientId"
                        value={entryPayement.clientId}
                        options={importers.map(imp => ({
                            label: imp.nom,
                            value: imp.importateurId
                        }))}
                        onChange={(e) => handleDropdownChange('importateurCreditId', e.value)}
                        placeholder="Sélectionnez un importateur"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="importateurCreditId">Importateur Crédit</label>
                    <Dropdown
                        id="importateurCreditId"
                        name="importateurCreditId"
                        value={entryPayement.importateurCreditId}
                        options={importateurCredits.map(imp => ({
                            label: imp.nom,
                            value: imp.importateurCreditId
                        }))}
                        onChange={(e) => handleDropdownChange('importateurCreditId', e.value)}
                        placeholder="Sélectionnez un importateur"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montantPaye">Montant Payé</label>
                    <InputNumber
                        id="montantPaye"
                        name="montantPaye"
                        value={entryPayement.montantPaye?.valueOf() || 0}
                        onValueChange={(e) => handleNumberChange('montantPaye', e.value ?? null)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="datePaiement">Date Paiement</label>
                    <Calendar
                        id="datePaiement"
                        value={entryPayement.datePaiement || new Date()}
                        onChange={(e) => handleDateChange('datePaiement', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>


                  <div className="field col-3">
                    <label htmlFor="reference">Numéro Bordereau/Recu</label>
                        <InputText
                            id="reference"
                            name="reference"
                            value={entryPayement.reference || ''}
                            onChange={handleChange}
                        />
                        
                </div>


                <div className="field col-3">
                    <label htmlFor="annee">Année</label>
                    <InputText
                        id="annee"
                        name="annee"
                        value={entryPayement.annee || ''}
                        onChange={handleChange}
                        maxLength={4}
                    />
                </div>


                <div className="field col-3">
                    <label htmlFor="lSuivre">Lettre à Suivre</label>
                    <Checkbox
                        inputId="lSuivre"
                        name="lSuivre"
                        checked={entryPayement.lSuivre}
                        onChange={handleCheckboxChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="credit">Crédit</label>
                    <Checkbox
                        inputId="credit"
                        name="credit"
                        checked={entryPayement.credit}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default EntryPayementForm;