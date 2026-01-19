'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { OtherExitInvoice } from "./OtherExitInvoice";
import { EnterRSP } from "./EnterRSP";
import { Button } from "primereact/button";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";


interface OtherExitInvoiceProps {
    otherExitInvoice: OtherExitInvoice;
    otherExitInvoice1: OtherExitInvoice;
    enterRSPs: EnterRSP[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleRSPSelect: (rsp: string) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    //handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearchByRSP: (e: React.MouseEvent) => Promise<void>; // Modifiez la signature
    //handleSearchByRSP: () => void; // Nouvelle prop pour la recherche
    //handleSearchByRSP?: () => void;

}

const OtherExitInvoiceForm: React.FC<OtherExitInvoiceProps> = ({
    otherExitInvoice,
    handleChange,
    handleDateChange,
    handleNumberChange,
    handleSearchByRSP,
    handleCheckboxChange
    // handleSearchByRSP={handleSearchByRSP} // Ajoutez cette ligne
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-3">
                    <label htmlFor="rsp">RSP</label>
                    <div className="p-inputgroup">
                        <InputText
                            id="rsp"
                            name="rsp"
                            value={otherExitInvoice.rsp}
                            onChange={handleChange}
                            placeholder="Entrez le RSP"
                        />
                        <Button
                            label="Chercher"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSearchByRSP(e);
                            }}
                            type="button"
                        />
                    </div>
                </div>

                <div className="field col-3">
                    <label htmlFor="lettreTransport">Lettre de Transport</label>
                    <InputText
                        id="lettreTransport"
                        name="lettreTransport"
                        value={otherExitInvoice.lettreTransport}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="noEntree">Numéro d'Entrée</label>
                    <InputNumber
                        id="noEntree"
                        name="noEntree"
                        value={otherExitInvoice.noEntree}
                        onValueChange={(e) => handleNumberChange('noEntree', e.value ?? null)}
                        mode="decimal"
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateEntree">Date d'Entrée</label>
                    <Calendar
                        id="dateEntree"
                        value={otherExitInvoice.dateEntree}
                        onChange={(e) => handleDateChange('dateEntree', e.value as Date)}
                        dateFormat="dd/mm/yy"
                        readOnlyInput
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="nbreColis">Nombre de Colis</label>
                    <InputNumber
                        id="nbreColis"
                        name="nbreColis"
                        value={otherExitInvoice.nbreColis}
                        onValueChange={(e) => handleNumberChange('nbreColis', e.value ?? null)}
                        mode="decimal"
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="tonage">Tonage</label>
                    <InputNumber
                        id="tonage"
                        name="tonage"
                        value={otherExitInvoice.tonage}
                        onValueChange={(e) => handleNumberChange('tonage', e.value ?? null)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateSortie">Date de facturation</label>
                    <Calendar
                        id="dateSortie"
                        value={otherExitInvoice.dateSortie || new Date()}
                        onChange={(e) => handleDateChange('dateSortie', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

                {/*<div className="field col-3">
                    <label htmlFor="expImp">Exp/Imp</label>
                    <InputText
                        id="expImp"
                        name="expImp"
                        value={otherExitInvoice.expImp}
                        onChange={handleChange}
                    />
                </div> */}

              {/*  <div className="field col-3">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={otherExitInvoice.montant}
                        onValueChange={(e) => handleNumberChange('montant', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>
                     */}

                <div className="field col-3">
                    <label htmlFor="taxeMag">Taxe Magasin</label>
                    <InputNumber
                        id="taxeMag"
                        name="taxeMag"
                        value={otherExitInvoice.taxeMag}
                        onValueChange={(e) => handleNumberChange('taxeMag', e.value ?? null)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>


                <div className="field col-3">
                    <label htmlFor="tauxChange">Taux change</label>
                    <InputNumber
                        id="tauxChange"
                        name="tauxChange"
                        value={otherExitInvoice.tauxChange ?? 0}
                        onValueChange={(e) => handleNumberChange('TauxChange', e.value ?? 0)}
                        readOnly
                    />
                </div>

               

                <div className="field col-3">
                    <label htmlFor="tauxReduction">Taux reduction</label>
                    <InputNumber
                        id="tauxReduction"
                        name="tauxReduction"
                        value={otherExitInvoice.tauxReduction ?? 0}
                        onValueChange={(e) => handleNumberChange('tauxReduction', e.value ?? 0)}
                    />
                </div>


                <div className="field col-3">
                    <label htmlFor="soldeTonage">Solde Tonnage</label>
                    <InputNumber
                        id="soldeTonage"
                        name="soldeTonage"
                        value={otherExitInvoice.soldeTonage || 0}
                        onValueChange={(e) => handleNumberChange('soldeTonage', e.value || 0)}
                        mode="decimal" // Utilisez decimal au lieu de currency pour les valeurs non monétaires
                        minFractionDigits={2}
                        maxFractionDigits={2}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montantReduction">Montant Reduction</label>
                    <InputNumber
                        id="montantReduction"
                        name="montantReduction"
                        value={otherExitInvoice.montantReduction ?? 0}
                        onValueChange={(e) => handleNumberChange('montantReduction', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>


                <div className="field col-3">
                    <label htmlFor="dateDerniereSortie">Derniere date de sortie</label>
                    <Calendar
                        id="dateDerniereSortie"
                        value={otherExitInvoice.dateDerniereSortie}
                        onChange={(e) => handleDateChange('dateDerniereSortie', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="manutention">Manutention</label>
                    <Checkbox
                        inputId="manutention"
                        name="manutention"
                        checked={otherExitInvoice.manutention}
                        onChange={handleCheckboxChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="supplement">Supplement</label>
                    <Checkbox
                        inputId="supplement"
                        name="supplement"
                        checked={otherExitInvoice.supplement}
                        onChange={handleCheckboxChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateSupplement">Date Supplement</label>
                    <Calendar
                        id="dateSupplement"
                        value={otherExitInvoice.dateSupplement}
                        onChange={(e) => handleDateChange('dateSupplement', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

            </div>





        </div>
    );
};

export default OtherExitInvoiceForm;