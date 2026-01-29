// FacFactureSortieForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { FacFactureSortie } from "./FacFactureSortie";

interface FacFactureSortieProps {
    facFactureSortie: FacFactureSortie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
}

const paymentModes = [
    { label: 'Espèces', value: 'CASH' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Carte Bancaire', value: 'CARTE' }
];

const FacFactureSortieForm: React.FC<FacFactureSortieProps> = ({
    facFactureSortie,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleCheckboxChange,
    handleDropdownChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="numFacture">Numéro Facture</label>
                    <InputText
                        id="numFacture"
                        name="numFacture"
                        value={facFactureSortie.numFacture}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="rsp">RSP</label>
                    <InputText
                        id="rsp"
                        name="rsp"
                        value={facFactureSortie.rsp}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="lt">Lettre de Transport</label>
                    <InputText
                        id="lt"
                        name="lt"
                        value={facFactureSortie.lt}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="dateSortie">Date Sortie</label>
                    <Calendar
                        id="dateSortie"
                        name="dateSortie"
                        value={facFactureSortie.dateSortie}
                        onChange={(e) => {
                            if (e.value instanceof Date) {
                                handleDateChange(e.value, "dateSortie");
                            } else if (e.value === null) {
                                handleDateChange(null, "dateSortie");
                            }
                        }}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montTotalManut">Montant Total Manutention</label>
                    <InputNumber
                        id="montTotalManut"
                        name="montTotalManut"
                        value={facFactureSortie.montTotalManut}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montMagasinage">Montant Magasinage</label>
                    <InputNumber
                        id="montMagasinage"
                        name="montMagasinage"
                        value={facFactureSortie.montMagasinage}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montGardienage">Montant Gardiennage</label>
                    <InputNumber
                        id="montGardienage"
                        name="montGardienage"
                        value={facFactureSortie.montGardienage}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="XOF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montTVA">Montant TVA</label>
                    <InputNumber
                        id="montTVA"
                        name="montTVA"
                        value={facFactureSortie.montTVA}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="XOF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montantPaye">Montant Payé</label>
                    <InputNumber
                        id="montantPaye"
                        name="montantPaye"
                        value={facFactureSortie.montantPaye}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="XOF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="exonere">Exonéré</label>
                    <Checkbox
                        inputId="exonere"
                        name="exonere"
                        checked={facFactureSortie.exonere}
                        onChange={handleCheckboxChange}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="modePayement">Mode de Paiement</label>
                    <Dropdown
                        id="modePayement"
                        name="modePayement"
                        value={facFactureSortie.modePayement}
                        options={paymentModes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un mode"
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="isValid">Validé</label>
                    <Checkbox
                        inputId="isValid"
                        name="isValid"
                        checked={facFactureSortie.isValid}
                        onChange={handleCheckboxChange}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="annule">Annulé</label>
                    <Checkbox
                        inputId="annule"
                        name="annule"
                        checked={facFactureSortie.annule}
                        onChange={handleCheckboxChange}
                    />
                </div>
                {facFactureSortie.annule && (
                    <div className="field col-12">
                        <label htmlFor="motifAnnulation">Motif Annulation</label>
                        <InputText
                            id="motifAnnulation"
                            name="motifAnnulation"
                            value={facFactureSortie.motifAnnulation}
                            onChange={handleChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacFactureSortieForm;