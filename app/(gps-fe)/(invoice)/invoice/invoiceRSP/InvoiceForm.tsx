'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
//import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Invoice, ManutentionResult } from "./Invoice";
import { Image as PdfImage } from '@react-pdf/renderer';

interface InvoiceFormProps {
    invoice: Invoice;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleGeneratePdf: () => void;
    handleCalculate: (endpointType: 'menutention' | 'supplement' | 'solde') => Promise<ManutentionResult>;

}

const paymentModes = [
    { label: 'Espèces', value: '1' },
    { label: 'Chèque', value: '2' },
    { label: 'Virement', value: '3' },
    { label: 'Carte Bancaire', value: '4' }
];
export const PdfLogo = () => (
    <PdfImage
        src="/settings/image/test.PNG"
        style={{ width: 100, height: 50 }}
    />
);
const InvoiceForm: React.FC<InvoiceFormProps> = ({
    invoice,
    handleChange,
    handleDateChange,
    handleNumberChange,
    handleCheckboxChange,
    handleCalculate,
    handleDropdownChange,
    //handleGeneratePdf={handleGeneratePdf} // Ajoutez cette ligne
    handleGeneratePdf = () => { },
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Calcul Menutention"
                        id="calcul"
                        name="calcul"
                        icon="pi pi-calculator"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCalculate('menutention');
                        }}
                        type="button"
                    />
                </div>
                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Calcul Supplement"
                        id="calculSupplemnt"
                        name="calculSupplemnt"
                        icon="pi pi-calculator"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCalculate('supplement');
                        }}
                        type="button"
                    />
                </div>
                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Calcul Solde"
                        id="calculSolde"
                        name="calculSolde"
                        icon="pi pi-calculator"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCalculate('solde');
                        }}
                        type="button"
                    />
                </div>



                <div className="field col-3 flex justify-content-end">
                    <Button
                        label="Facture Proforma"
                        id="Impr"
                        name="Impr"
                        icon="pi pi-calculator"
                        onClick={handleGeneratePdf}
                        //className="p-button-success"
                        type="button"
                    />
                </div>
            </div>
            <div className="formgrid grid">

                <div className="field col-3">
                    <label htmlFor="SortieId">Numéro Facture</label>
                    <InputText
                        id="SortieId"
                        name="SortieId"
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

                <div className="field col-3">
                    <label htmlFor="lt">Lettre de Transport</label>
                    <InputText
                        id="lt"
                        name="lt"
                        value={invoice.lt}
                        onChange={handleChange}
                    />
                </div>


                 <div className="field col-3">
                    <label htmlFor="DateSortie">Date d'Entrée</label>
                    <Calendar
                        id="DateSortie"
                        name="DateSortie"
                        value={invoice.dateSortie ?? new Date()}
                        onChange={(e) => handleDateChange('DateSortie', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="DateSortie">Date de Sortie</label>
                    <Calendar
                        id="DateSortie"
                        name="DateSortie"
                        value={invoice.dateSortie ?? new Date()}
                        onChange={(e) => handleDateChange('DateSortie', e.value as Date)}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

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
                    <label htmlFor="montLais">Montant Laissez- suivre</label>
                    <InputNumber
                        id="MontLais"
                        name="MontLais"
                        value={invoice.montLais}
                        onValueChange={(e) => handleNumberChange('MontLais', e.value ?? 0)}
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
                    <label htmlFor="MontFixationPlaque">Montant Fixation Plaque</label>
                    <InputNumber
                        id="MontFixationPlaque"
                        name="MontFixationPlaque"
                        value={invoice.montFixationPlaque || 0}
                        onValueChange={(e) => handleNumberChange('MontFixationPlaque', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                    //readOnly={invoice.montFixationPlaque} // Optionnel : empêche la modification manuelle
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montTotalManut">Montant Total Manutention</label>
                    <InputNumber
                        id="montTotalManut"
                        name="montTotalManut"

                        value={
                            invoice.montTVA == 0
                                //? (invoice.montTotalManut || 0) - (invoice.montFixeTVA || 0) + (invoice.montFixationPlaque || 0)
                                ? (invoice.montTotalManut || 0) - (invoice.montFixationPlaque || 0)

                                : (invoice.montTotalManut || 0) + (invoice.montFixationPlaque || 0) * 0.18
                        }
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
                        //value={(invoice.montTotalManut || 0) + (invoice.montFixationPlaque || 0)}
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


                <div className="field col-3" style={{ display: 'none' }}>
                    <label htmlFor="montfixeTVA">Montant TVA1</label>
                    <InputNumber
                        id="montfixeTVA"
                        name="montfixeTVA"
                        value={invoice.montFixeTVA || 0 + (invoice.montFixationPlaque || 0) * 18.0 / 100.0}
                        //value={(invoice.montTotalManut || 0) + (invoice.montFixationPlaque || 0)}
                        onValueChange={(e) => handleNumberChange('montfixeTVA', e.value ?? 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-MG"
                        readOnly

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



                <div className="field col-3">
                    <label htmlFor="declarant">Déclarant</label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={invoice.declarant}
                        onChange={handleChange}
                    />
                </div>

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
                    <label htmlFor="exonere">Exonéré</label>
                    <Checkbox
                        inputId="exonere"
                        name="exonere"
                        checked={invoice.exonere || false}
                        onChange={handleCheckboxChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="fixationPlaque">Fixation Plaque</label>
                    <Checkbox
                        inputId="fixationPlaque"
                        name="fixationPlaque"
                        checked={invoice.fixationPlaque || false}
                        onChange={handleCheckboxChange}

                    />
                </div>

                <div className="field col-3" style={{ display: 'none' }}>
                    <label htmlFor="marchandiseId">MarchandiseId</label>
                    <InputText
                        id="marchandiseId"
                        name="marchandiseId"
                        value={invoice.marchandiseId?.toString() || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3" >
                    <label htmlFor="nomMarchandise">Marchandise</label>
                    <InputText
                        id="marchandise"
                        name="marchandise"
                        value={invoice.nomMarchandise?.toString() || ''}
                        onChange={handleChange}
                    />
                </div>


                <div className="field col-3" style={{ display: 'none' }}>
                    <label htmlFor="clientId">ClientId</label>
                    <InputText
                        id="clientId"
                        name="clientId"
                        value={invoice.clientId?.toString() || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3" >
                    <label htmlFor="nomClient">Importateur</label>
                    <InputText
                        id="nomClient"
                        name="nomClient"
                        value={invoice.nomClient?.toString() || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="duree">Duree</label>
                    <InputNumber
                        id="duree"
                        name="duree"
                        value={invoice.duree ?? 0}
                        onValueChange={(e) => handleNumberChange('duree', e.value ?? 0)}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="tonnage">Tonnage</label>  {/* Changé de 'tonage' à 'tonnage' */}
                    <InputNumber
                        id="tonnage"  // Changé de 'tonage' à 'tonnage'
                        name="tonnage"  // Changé de 'tonage' à 'tonnage'
                        value={invoice.tonnage ?? 0}  // Changé de 'tonage' à 'tonnage'
                        onValueChange={(e) => handleNumberChange('tonnage', e.value ?? 0)}  // Changé de 'tonage' à 'tonnage'
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        disabled
                    />
                </div>

                {/*
                <div className="field col-3">
                    <label htmlFor="duree37">Duree37</label>
                    <InputNumber
                        id="duree37"
                        name="duree37"
                        value={invoice.duree37 ?? 0}
                        onValueChange={(e) => handleNumberChange('duree37', e.value ?? 0)}
                    />
                </div>
                      */}


                <div className="field col-3">
                    <label htmlFor="etiquete">Voulez-vous enlever montant Etiquete?</label>
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