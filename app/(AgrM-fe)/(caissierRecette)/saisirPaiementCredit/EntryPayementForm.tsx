'use client';

import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { EntryPayement, Bank, CompteBanque, ImportateurCredit, AccostageCaisse } from "./entryPayement";
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Button } from "primereact/button";

interface EntryPayementFormProps {
    entryPayement: EntryPayement;
    banks: Bank[];
    bankAccounts: CompteBanque[];
    creditImporters: ImportateurCredit[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleBankChange: (e: DropdownChangeEvent) => void;
    fetchInvoiceData: (factureId: string) => void;
    loading?: boolean;
}

const paymentTypes = [
    { label: 'Espèces', value: 'CASH' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Carte Bancaire', value: 'CARTE' },
    { label: 'CREDIT', value: 'CREDIT' }
];

const typeOptions = [
    { label: 'Service ou GPS', value: 'Service' },
    { label: 'RSP', value: 'RSP' },
    { label: 'Accostage', value: 'Accostage' },
   //    { label: 'Autres BUCECO', value: 'AutresBUCECO' },
    { label: 'Romarquage', value: 'Romarquage' },
    //{ label: 'Chargement café', value: 'ChargCafe' },
   // { label: 'Magasin Acheteur', value: 'MagAcheteur' },
    //{ label: 'Dechargement Cafe', value: 'DechargCafe' },
   // { label: 'Gardinage Acheteur', value: 'GardAcheteur' },
     { label: 'Autres BUCECO / GREAT LAKES', value: 'AutresBUCECO' },
   // { label: 'Autres', value: 'Autres' }
];

const EntryPayementForm: React.FC<EntryPayementFormProps> = ({
    entryPayement,
    banks,
    bankAccounts,
    creditImporters,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleCheckboxChange,
    handleDropdownChange,
    handleBankChange,
    fetchInvoiceData,
    loading = false
}) => {
    const [filteredAccounts, setFilteredAccounts] = useState<CompteBanque[]>([]);
    const [invoiceSearch, setInvoiceSearch] = useState<string>('');

    useEffect(() => {
        if (entryPayement.banqueId) {
            const accounts = bankAccounts.filter(acc => acc.banqueId === entryPayement.banqueId);
            setFilteredAccounts(accounts);
        } else {
            setFilteredAccounts([]);
        }
    }, [entryPayement.banqueId, bankAccounts]);

    const handleInvoiceSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceSearch(e.target.value);
    };

   function getCookieValue(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}
const [caissierId, setCaissierId] = useState<number | null>(null);
const [fullName, setFullName] = useState<string>('');

    const handleInvoiceSearchSubmit = () => {
        if (invoiceSearch) {
            fetchInvoiceData(invoiceSearch);
        }
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="type">Type</label>
                    <Dropdown
                        id="type"
                        name="type"
                        value={entryPayement.type}
                        options={typeOptions}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                        disabled={loading}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="factureId">Numéro Facture</label>
                    <div className="p-inputgroup">
                        <InputText
                            id="factureId"
                            name="factureId"
                            value={invoiceSearch}
                            onChange={handleInvoiceSearch}
                            placeholder="Rechercher facture"
                            disabled={loading}
                        />
                        <Button
                            icon="pi pi-search"
                            onClick={handleInvoiceSearchSubmit}
                            tooltip="Récupérer les données de la facture"
                            disabled={loading}
                            loading={loading}
                        />
                    </div>
                </div>
                <div className="field col-4">
                    <label htmlFor="rsp">RSP/LT</label>
                    <InputText
                        id="rsp"
                        name="rsp"
                        value={entryPayement.rsp}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montantPaye">Montant Payé </label>
                    <div className="p-inputgroup">
                    <InputNumber
                        id="montantPaye"
                        name="montantPaye"
                        value={entryPayement.montantPaye}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        readOnly
                    />
                </div>
                </div>
              {/*  <div className="field col-4">
                    <label htmlFor="nom">Client</label>
                    <InputText
                        id="nom"
                        name="nom"
                        value={entryPayement.clientNom}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
              */} 
                 {entryPayement.credit && (
                    <div className="field col-4">
                        <label htmlFor="importateurCreditId">Client Crédit</label>
                        <Dropdown
                            id="importateurCreditId"
                            name="importateurCreditId"
                            value={entryPayement.importateurCreditId}
                            options={creditImporters.map(imp => ({ label: imp.nom, value: imp.importateurCreditId }))}
                            onChange={handleDropdownChange}
                            placeholder="Sélectionnez un importateur"
                            filter
                            disabled={loading}
                        />
                    </div>
                )}
                <div className="field col-4">
                    <label htmlFor="modePaiement">Mode Paiement</label>
                    <Dropdown
                        id="modePaiement"
                        name="modePaiement"
                        value={entryPayement.modePaiement}
                        options={paymentTypes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un mode"
                        //disabled={loading}
                        readOnly
                        disabled
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="banqueId">Banque</label>
                    <Dropdown
                        id="banqueId"
                        name="banqueId"
                        value={entryPayement.banqueId}
                        options={banks.map(b => ({ label: b.libelleBanque, value: b.banqueId }))}
                        onChange={handleBankChange}
                        placeholder="Sélectionnez une banque"
                        filter
                        disabled
                        readOnly
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="compteBanqueId">Compte Bancaire</label>
                    <Dropdown
                        id="compteBanqueId"
                        name="compteBanqueId"
                        value={entryPayement.compteBanqueId}
                        options={filteredAccounts.map(acc => ({ label: acc.numeroCompte, value: acc.compteBanqueId }))}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un compte"
                        filter
                        disabled={!entryPayement.banqueId || loading}
                        readOnly
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="datePaiement">Date Opération</label>
                    <Calendar
                        id="datePaiement"
                        name="datePaiement"
                        value={entryPayement.datePaiement}
                        onChange={(e) => {
                            if (e.value instanceof Date || e.value === null) {
                                handleDateChange(e.value, "datePaiement");
                            }
                        }}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        disabled={loading}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="reference">Borderaux</label>
                    <InputText
                        id="reference"
                        name="reference"
                        value={entryPayement.reference}
                        onChange={handleChange}
                        disabled={loading}
                        readOnly
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="annee">Annee</label>
                    <InputText
                        id="annee"
                        name="annee"
                        value={entryPayement.annee || new Date().getFullYear().toString()}
                        onChange={handleChange}
                        disabled={loading}
                        readOnly
                    />
                </div>
               
               
               
                <div className="field col-4">
                    <label htmlFor="montantTVA">Montant TVA</label>
                    <InputNumber
                        id="montantTVA"
                        name="montantTVA"
                        value={entryPayement.montantTVA}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        //disabled 
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="montantHTVA">Montant HTVA</label>
                    <InputNumber
                        id="montantHTVA"
                        name="montantHTVA"
                        value={entryPayement.montantHTVA}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        //disabled={loading}
                    />
                </div>

                 <div className="field col-4">
                    <label htmlFor="credit">Crédit</label>
                    <Checkbox
                        inputId="credit"
                        name="credit"
                        checked={entryPayement.credit}
                        onChange={handleCheckboxChange}
                        disabled={loading}
                        readOnly
                    />
                </div>
               
                   {/*
                 <div className="field col-4">
                    <label htmlFor="CaissierId">CaissierId</label>
                    <InputNumber
                        id="CaissierId"
                        name="CaissierId"
                        value={entryPayement.caissierId}
                        onValueChange={handleNumberChange}
                        disabled={loading}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="fullName">fullNameCaissier</label>
                    <InputText
                        id="fullName"
                        name="fullName"
                        value={fullName}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                */}
                 
            </div>
        </div>
    );
};

export default EntryPayementForm;