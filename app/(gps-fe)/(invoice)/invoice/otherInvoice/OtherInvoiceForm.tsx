'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
//import { OtherInvoice } from "./OtherInvoice";
import { Importer } from "./Importer";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { OtherInvoice, OtherInvoiceValidationRequest } from './OtherInvoice';

interface OtherInvoiceFormProps {
     otherInvoice: OtherInvoice;
     //otherInvoiceValidationRequest :OtherInvoiceValidationRequest 
    importers: Importer[];
    selectedImporter: Importer | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleDateChange: (e: any, field: string) => void;
    onValidate?: () => void; // Nouvelle prop pour la validation
    //showValidateButton?: boolean; // Pour contrôler l'affichage du bouton
    onCancel?: (cancelReason: string) => void; // Nouvelle prop pour l'annulation
    showValidateButton?: boolean;
    showCancelButton?: boolean; // Pour contrôler l'affichage du bouton d'annulation
}

const paymentModes = [
    { label: 'Espèces', value: '1' },
    { label: 'Chèque', value: '2' },
    { label: 'Virement', value: '3' },
    { label: 'Carte Bancaire', value: '4' }
];
const clients = [
    { label: 'BUCECO', value: 3165 },
    { label: 'GREAT LAKES CEMENT', value: 33005 }
];

const OtherInvoiceForm: React.FC<OtherInvoiceFormProps> = ({
    otherInvoice,
    importers,
    selectedImporter,
    handleChange,
    handleValueChange,
    handleDropDownSelect,
    handleDateChange,
    onValidate,
    showValidateButton = false,
    onCancel,
    showCancelButton = false
}) => 
    // Trouver le mode de paiement correspondant à la valeur stockée
    //const selectedPaymentMode = paymentModes.find(mode => mode.value === otherInvoice.modePayement) || null;
          {
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const handleCancelClick = () => {
        setShowCancelDialog(true);
    };

    const confirmCancel = () => {
        if (cancelReason.trim() === '') {
            return;
        }
        onCancel?.(cancelReason);
        setShowCancelDialog(false);
        setCancelReason('');
    };

    return (
        <div className="card p-fluid">
            {/* Section Informations générales */}
            <Panel header="Informations de base" toggleable>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="autreFactureId">No Facture</label>
                        <InputText
                            id="autreFactureId"
                            name="autreFactureId"
                            value={otherInvoice.autreFactureId || ''}
                            onChange={handleChange}
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="libelle">Ref</label>
                        <InputText
                            id="libelle"
                            name="libelle"
                            value={otherInvoice.libelle || ''}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    
                    <div className="field col-12 md:col-3">
                        <label htmlFor="clientId">Client</label>
                        <Dropdown
                            id="clientId"
                            name="clientId"
                            value={otherInvoice.clientId}
                            options={clients}
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionner un importateur"
                            className="w-full"
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="nomBateau">Nom du Bateau</label>
                        <InputText
                            id="nomBateau"
                            name="nomBateau"
                            value={otherInvoice.nomBateau || ''}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="lot">Lot</label>
                        <InputText
                            id="lot"
                            name="lot"
                            value={otherInvoice.lot || ''}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="nbreNuite">Nbre de Nuite</label>
                        <InputNumber
                            id="nbreNuite"
                            name="nbreNuite"
                            value={otherInvoice.nbreNuite || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                        />
                    </div>

                     <div className="field col-12 md:col-3">
                        <label htmlFor="modePayement">Mode de Paiement</label>
                        <Dropdown
                            id="modePayement"
                            name="modePayement"
                            value={otherInvoice.modePayement}
                            options={paymentModes}
                            optionLabel="label"
                            onChange={handleDropDownSelect}
                            placeholder="Sélectionnez un mode"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateFacture">Date Facture</label>
                        <Calendar
                            id="dateFacture"
                            name="dateFacture"
                            value={otherInvoice.dateFacture ? new Date(otherInvoice.dateFacture) : null}
                            onChange={(e) => handleDateChange(e, 'dateFacture')}
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-12">
                        <label htmlFor="plaque">Plaque</label>
                        <InputText
                            id="plaque"
                            name="plaque"
                            value={otherInvoice.plaque || ''}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    
                    
                </div>
            </Panel>

            {/* Section Poids */}
            <Panel header="Poids" toggleable>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="qteBateau">Q.Bateau</label>
                        <InputNumber
                            id="qteBateau"
                            name="qteBateau"
                            value={otherInvoice.qteBateau || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="qteSurtaxe">Q.Surtaxe</label>
                        <InputNumber
                            id="qteSurtaxe"
                            name="qteSurtaxe"
                            value={otherInvoice.qteSurtaxe || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="qteSalissage">Q.Salissage</label>
                        <InputNumber
                            id="qteSalissage"
                            name="qteSalissage"
                            value={otherInvoice.qteSalissage || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="qtePeage">Q.Peage & Pesage</label>
                        <InputNumber
                            id="qtePeage"
                            name="qtePeage"
                            value={otherInvoice.qtePeage || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                       
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

                    <div className="field col-12 md:col-3">
                        <label htmlFor="poidsPaye">Poids Payé </label>
                        <InputNumber
                            id="poidsPaye"
                            name="poidsPaye"
                            value={otherInvoice.poidsPaye || 0}
                            onValueChange={handleValueChange}
                            //mode="decimal"
                            //minFractionDigits={4}
                            //maxFractionDigits={4}
                            //suffix=" kg"
                            className="w-full"
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

                    <div className="field col-12 md:col-3">
                        <label htmlFor="poidsPese">Poids Pesé </label>
                        <InputNumber
                            id="poidsPese"
                            name="poidsPese"
                            value={otherInvoice.poidsPese || 0}
                            onValueChange={handleValueChange}
                            //mode="decimal"
                            // minFractionDigits={4}
                            //maxFractionDigits={4}
                            // suffix=" kg"
                            className="w-full"
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

                    <div className="field col-12 md:col-3">
                        <label htmlFor="poidsRoute">Poids Route (kg)</label>
                        <InputNumber
                            id="poidsRoute"
                            name="poidsRoute"
                            value={otherInvoice.poidsRoute || 0}
                            onValueChange={handleValueChange}
                            //mode="decimal"
                            // minFractionDigits={4}
                            //maxFractionDigits={4}
                            //suffix=" kg"
                            className="w-full"
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

                    <div className="field col-12 md:col-3">
                        <label htmlFor="poidsNetAPayer">Poids Net à Payer</label>
                        <InputNumber
                            id="poidsNetAPayer"
                            name="poidsNetAPayer"
                            value={otherInvoice.poidsNetAPayer || 0}
                            onValueChange={handleValueChange}
                            // mode="decimal"
                            // minFractionDigits={4}
                            //maxFractionDigits={4}
                            //suffix=" kg"
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="qteAbonnementTour">Q.AbonnementTour</label>
                        <InputNumber
                            id="qteAbonnementTour"
                            name="qteAbonnementTour"
                            value={otherInvoice.qteAbonnementTour || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="qteGardiennageVehicule">Q.Gardiennage Vehicule</label>
                        <InputNumber
                            id="qteGardiennageVehicule"
                            name="qteGardiennageVehicule"
                            value={otherInvoice.qteGardiennageVehicule || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="soldePositif">Solde Positif</label>
                        <InputNumber
                            id="soldePositif"
                            name="soldePositif"
                            value={otherInvoice.soldePositif || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="soldeNegatif">Solde Negatif</label>
                        <InputNumber
                            id="soldeNegatif"
                            name="soldeNegatif"
                            value={otherInvoice.soldeNegatif || 0}
                            onValueChange={handleValueChange}
                            className="w-full"
                            readOnly
                        />
                    </div>
                </div>
            </Panel>

             {/* Section Montants */}
            <Panel header="Montants" toggleable>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="puBateau">PU Bateau</label>
                        <InputNumber
                            id="puBateau"
                            name="puBateau"
                            value={otherInvoice.puBateau ?? 44138}
                            onValueChange={handleValueChange}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="puSurtaxe">PU Surtaxe</label>
                        <InputNumber
                            id="puSurtaxe"
                            name="puSurtaxe"
                            value={otherInvoice.puSurtaxe ?? 542}
                            onValueChange={handleValueChange}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="puSalissage">PU Salissage</label>
                        <InputNumber
                            id="puSalissage"
                            name="puSalissage"
                            value={otherInvoice.puSalissage ?? 434}
                            onValueChange={handleValueChange}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="puPeage">PU Peage</label>
                        <InputNumber
                            id="puPeage"
                            name="puPeage"
                            value={otherInvoice.puPeage ?? 104036}
                            onValueChange={handleValueChange}
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="redevPeage">Redev Peage</label>
                        <InputNumber
                            id="redevPeage"
                            name="redevPeage"
                            value={otherInvoice.redevPeage ?? 23395}
                            onValueChange={handleValueChange}
                            locale="fr-FR"
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="abonnementTour">Abonnement Tour</label>
                        <InputNumber
                            id="abonnementToure"
                            name="abonnementTour"
                            value={otherInvoice.abonnementTour || 0}
                            onValueChange={handleValueChange}
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="montantManut">Montant Manutention</label>
                        <InputNumber
                            id="montantManut"
                            name="montantManut"
                            value={otherInvoice.montantManut || 0}
                            onValueChange={handleValueChange}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="montantMag">Montant Magasinage</label>
                        <InputNumber
                            id="montantMag"
                            name="montantMag"
                            value={otherInvoice.montantMag || 0}
                            onValueChange={handleValueChange}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="redevance">Redevance Informatique</label>
                        <InputNumber
                            id="redevance"
                            name="redevance"
                            value={otherInvoice.redevance ?? 23395}
                            onValueChange={handleValueChange}
                            locale="fr-FR"
                            className="w-full"
                            readOnly
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="tva">TVA</label>
                        <InputNumber
                            id="tva"
                            name="tva"
                            value={otherInvoice.tva || 0}
                            onValueChange={handleValueChange}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>



                    <div className="field col-12 md:col-3">
                        <label htmlFor="gardiennageVehicule">Gardiennage Vehicule</label>
                        <InputNumber
                            id="gardiennageVehicule"
                            name="gardiennageVehicule"
                            value={otherInvoice.gardiennageVehicule || 0}
                            onValueChange={handleValueChange}
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="redevGardiennage">Redev Gardiennage</label>
                        <InputNumber
                            id="redevGardiennage"
                            name="redevGardiennage"
                            value={otherInvoice.redevGardiennage || 0}
                            onValueChange={handleValueChange}
                            locale="fr-FR"
                            className="w-full"
                        />
                    </div>
                </div>
            </Panel>
             {(showValidateButton || showCancelButton) && (
                <div className="flex justify-content-end gap-2 mt-3">
                    {showCancelButton && (
                        <>
                            

                            <Dialog 
                                header="Motif d'annulation" 
                                visible={showCancelDialog} 
                                style={{ width: '50vw' }}
                                onHide={() => setShowCancelDialog(false)}
                            >
                                <div className="p-field">
                                    <label htmlFor="cancelReason">Veuillez saisir le motif d'annulation</label>
                                    <InputText
                                        id="cancelReason"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div className="flex justify-content-end gap-2 mt-3">
                                    <Button
                                        label="Retour"
                                        icon="pi pi-arrow-left"
                                        onClick={() => setShowCancelDialog(false)}
                                        className="p-button-text"
                                    />
                                    <Button
                                        label="Confirmer l'annulation"
                                        icon="pi pi-check"
                                        onClick={confirmCancel}
                                        disabled={!cancelReason.trim()}
                                        severity="danger"
                                    />
                                </div>
                            </Dialog>
                        </>
                    )}

                    {showValidateButton && (
                        <Button
                            label="Valider"
                            icon="pi pi-check-circle"
                            severity="success"
                            onClick={onValidate}
                            disabled={!otherInvoice.autreFactureId && !!otherInvoice.dateValidation}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

 


export default OtherInvoiceForm;