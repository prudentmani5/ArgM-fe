'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Invoice, ManutentionResult } from "./Invoice";

interface InvoiceFormProps {
    invoice: Invoice;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleGeneratePdf: () => void;
    handleCalculate: (endpointType: 'menutention' | 'supplement' | 'solde') => Promise<ManutentionResult>;
    btnLoading?: boolean;
}

const paymentModes = [
    { label: 'Espèces', value: '1' },
    { label: 'Chèque', value: '2' },
    { label: 'Virement', value: '3' },
    { label: 'Carte Bancaire', value: '4' }
];

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    invoice,
    handleChange,
    handleDateChange,
    handleNumberChange,
    handleCheckboxChange,
    handleCalculate,
    handleDropdownChange,
    handleGeneratePdf = () => { },
    btnLoading = false
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Calcul Manutention"
                        icon="pi pi-calculator"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCalculate('menutention');
                        }}
                        type="button"
                        loading={btnLoading}
                    />
                </div>
                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Calcul Supplement"
                        icon="pi pi-calculator"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCalculate('supplement');
                        }}
                        type="button"
                        loading={btnLoading}
                    />
                </div>
                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Calcul Solde"
                        icon="pi pi-calculator"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCalculate('solde');
                        }}
                        type="button"
                        loading={btnLoading}
                    />
                </div>

                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Facture Proforma"
                        icon="pi pi-file-pdf"
                        onClick={handleGeneratePdf}
                        className="p-button-success"
                        type="button"
                    />
                </div>
            </div>

            <div className="formgrid grid">
                <div className="field col-3">
                    <label htmlFor="sortieId">Numéro Facture</label>
                    <InputText
                        id="sortieId"
                        name="sortieId"
                        value={invoice.sortieId || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="rsp">RSP</label>
                    <InputText
                        id="rsp"
                        name="rsp"
                        value={invoice.rsp}
                        onChange={handleChange}
                        style={{
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '6px'
                        }}
                    />
                </div>

              {/*  <div className="field col-3">
                    <label htmlFor="lt">Lettre de Transport</label>
                    <InputText
                        id="lt"
                        name="lt"
                        value={invoice.lt}
                        onChange={handleChange}
                    />
                </div>
                


                 <div className="field col-3">
                    <label htmlFor="dateEntree">Date Entree</label>
                    <Calendar
                        id="dateEntree"
                        name="dateEntree"
                        value={invoice.dateEntree }
                        onChange={(e) => handleDateChange('dateEntree', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>
                       

                <div className="field col-3">
                    <label htmlFor="dateSortie">Date de Sortie</label>
                    <Calendar
                        id="dateSortie"
                        name="dateSortie"
                        value={invoice.dateSortie}
                        onChange={(e) => handleDateChange('dateSortie', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>
                          */}
                <div className="field col-3">
                    <label htmlFor="manutBateau">Manutention Bateau</label>
                    <InputNumber
                        id="manutBateau"
                        name="manutBateau"
                        value={invoice.manutBateau}
                        onValueChange={(e) => handleNumberChange('manutBateau', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="manutCamion">Manutention Camion</label>
                    <InputNumber
                        id="manutCamion"
                        name="manutCamion"
                        value={invoice.manutCamion}
                        onValueChange={(e) => handleNumberChange('manutCamion', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="surtaxeColisLourd">Surtaxe Colis Lourd</label>
                    <InputNumber
                        id="surtaxeColisLourd"
                        name="surtaxeColisLourd"
                        value={invoice.surtaxeColisLourd}
                        onValueChange={(e) => handleNumberChange('surtaxeColisLourd', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montArrimage">Montant Arrimage</label>
                    <InputNumber
                        id="montArrimage"
                        name="montArrimage"
                        value={invoice.montArrimage}
                        onValueChange={(e) => handleNumberChange('montArrimage', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montRedev">Montant Redevance</label>
                    <InputNumber
                        id="montRedev"
                        name="montRedev"
                        value={invoice.montRedev}
                        onValueChange={(e) => handleNumberChange('montRedev', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montPalette">Montant Palette</label>
                    <InputNumber
                        id="montPalette"
                        name="montPalette"
                        value={invoice.montPalette}
                        onValueChange={(e) => handleNumberChange('montPalette', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montPesMag">Montant Pesage Magasin</label>
                    <InputNumber
                        id="montPesMag"
                        name="montPesMag"
                        value={invoice.montPesMag}
                        onValueChange={(e) => handleNumberChange('montPesMag', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montLais">Montant Laissez-suivre</label>
                    <InputNumber
                        id="montLais"
                        name="montLais"
                        value={invoice.montLais}
                        onValueChange={(e) => handleNumberChange('montLais', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="peage">Péage</label>
                    <InputNumber
                        id="peage"
                        name="peage"
                        value={invoice.peage}
                        onValueChange={(e) => handleNumberChange('peage', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montEtiquette">Montant Etiquette</label>
                    <InputNumber
                        id="montEtiquette"
                        name="montEtiquette"
                        value={invoice.montEtiquette}
                        onValueChange={(e) => handleNumberChange('montEtiquette', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montFixationPlaque">Montant Fixation Plaque</label>
                    <InputNumber
                        id="montFixationPlaque"
                        name="montFixationPlaque"
                        value={invoice.montFixationPlaque || 0}
                        onValueChange={(e) => handleNumberChange('montFixationPlaque', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montTotalManut">Montant Total Manutention</label>
                    <InputNumber
                        id="montTotalManut"
                        name="montTotalManut"
                       value={invoice.montTotalManut || 0}
                        onValueChange={(e) => handleNumberChange('montTotalManut', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                        readOnly
                        style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '6px'
                        }}
                        inputStyle={{
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            fontWeight: '600'
                        }}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montMagasinage">Montant Magasinage</label>
                    <InputNumber
                        id="montMagasinage"
                        name="montMagasinage"
                        value={invoice.montMagasinage}
                        onValueChange={(e) => handleNumberChange('montMagasinage', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montGardienage">Montant Gardiennage</label>
                    <InputNumber
                        id="montGardienage"
                        name="montGardienage"
                        value={invoice.montGardienage}
                        onValueChange={(e) => handleNumberChange('montGardienage', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montTVA">Montant TVA</label>
                    <InputNumber
                        id="montTVA"
                        name="montTVA"
                        value={invoice.montTVA || 0 + (invoice.montFixationPlaque || 0) * 18.0 / 100.0}
                        onValueChange={(e) => handleNumberChange('montTVA', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                        readOnly
                        style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '6px'
                        }}
                        inputStyle={{
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            fontWeight: '600'
                        }}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montantPaye">Montant Payé</label>
                    <InputNumber
                        id="montantPaye"
                        name="montantPaye"
                        value={
                            invoice.montTVA == 0
                                ? (invoice.montantPaye || 0) - (invoice.montFixeTVA || 0) + (invoice.montFixationPlaque || 0)
                                : (invoice.montantPaye || 0) + (invoice.montFixationPlaque || 0) * 0.18
                        }
                        onValueChange={(e) => handleNumberChange('montantPaye', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                        readOnly
                        style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '6px'
                        }}
                        inputStyle={{
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            fontWeight: '600'
                        }}
                    />
                </div>
{/*
                <div className="field col-3">
                    <label htmlFor="declarant">Déclarant</label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={invoice.declarant}
                        onChange={handleChange}
                    />
                </div>
*/}

                <div className="field col-3">
                    <label htmlFor="dossierId">Dossier ID</label>
                    <InputText
                        id="dossierId"
                        name="dossierId"
                        value={invoice.dossierId}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="tauxReduction">Taux Réduction</label>
                    <InputNumber
                        id="tauxReduction"
                        name="tauxReduction"
                        value={invoice.tauxReduction}
                        onValueChange={(e) => handleNumberChange('tauxReduction', e.value ?? 0)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montantReduction">Montant Réduction</label>
                    <InputNumber
                        id="montantReduction"
                        name="montantReduction"
                        value={invoice.montantReduction}
                        onValueChange={(e) => handleNumberChange('montantReduction', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="modePayement">Mode de Paiement</label>
                    <Dropdown
                        id="modePayement"
                        name="modePayement"
                        value={invoice.modePayement}
                        options={paymentModes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un mode"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="exonere" className="block mb-2">Exonéré</label>
                    <Checkbox
                        inputId="exonere"
                        name="exonere"
                        checked={invoice.exonere || false}
                        onChange={handleCheckboxChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="fixationPlaque" className="block mb-2">Fixation Plaque</label>
                    <Checkbox
                        inputId="fixationPlaque"
                        name="fixationPlaque"
                        checked={invoice.fixationPlaque || false}
                        onChange={handleCheckboxChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="nomMarchandise">Marchandise</label>
                    <InputText
                        id="nomMarchandise"
                        name="nomMarchandise"
                        value={invoice.nomMarchandise || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="nomClient">Nom du Client</label>
                    <InputText
                        id="nomClient"
                        name="nomClient"
                        value={invoice.nomClient || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="duree">Durée</label>
                    <InputNumber
                        id="duree"
                        name="duree"
                        value={invoice.duree ?? 0}
                        onValueChange={(e) => handleNumberChange('duree', e.value ?? 0)}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="tonnage">Tonnage</label>
                    <InputNumber
                        id="tonnage"
                        name="tonnage"
                        value={invoice.tonnage ?? 0}
                        onValueChange={(e) => handleNumberChange('tonnage', e.value ?? 0)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        disabled
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="etiquete" className="block mb-2">Voulez-vous enlever montant Etiquete?</label>
                    <Checkbox
                        inputId="etiquete"
                        name="etiquete"
                        checked={invoice.etiquete || false}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;