import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { CptDossier } from './CptDossier';

interface CptDossierFormProps {
    cptDossier: CptDossier;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const CptDossierForm: React.FC<CptDossierFormProps> = ({
    cptDossier,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleCheckboxChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Informations générales */}
                <div className="field col-12">
                    <h5>Informations Générales</h5>
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="nomDossier">Nom du Dossier *</label>
                    <InputText
                        id="nomDossier"
                        name="nomDossier"
                        value={cptDossier.nomDossier}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="typeEntite">Type d&apos;Entité</label>
                    <InputText
                        id="typeEntite"
                        name="typeEntite"
                        value={cptDossier.typeEntite}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="nif">NIF</label>
                    <InputText
                        id="nif"
                        name="nif"
                        value={cptDossier.nif}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="registreCommerce">Registre de Commerce</label>
                    <InputText
                        id="registreCommerce"
                        name="registreCommerce"
                        value={cptDossier.registreCommerce}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="formeJuridique">Forme Juridique</label>
                    <InputText
                        id="formeJuridique"
                        name="formeJuridique"
                        value={cptDossier.formeJuridique}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="secteurActivite">Secteur d&apos;Activité</label>
                    <InputText
                        id="secteurActivite"
                        name="secteurActivite"
                        value={cptDossier.secteurActivite}
                        onChange={handleChange}
                    />
                </div>

                {/* Coordonnées */}
                <div className="field col-12">
                    <h5>Coordonnées</h5>
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText
                        id="adresse"
                        name="adresse"
                        value={cptDossier.adresse}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="bp">BP</label>
                    <InputText
                        id="bp"
                        name="bp"
                        value={cptDossier.bp}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroAdresse">Numéro d&apos;Adresse</label>
                    <InputText
                        id="numeroAdresse"
                        name="numeroAdresse"
                        value={cptDossier.numeroAdresse}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="province">Province</label>
                    <InputText
                        id="province"
                        name="province"
                        value={cptDossier.province}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="commune">Commune</label>
                    <InputText
                        id="commune"
                        name="commune"
                        value={cptDossier.commune}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="colline">Colline</label>
                    <InputText
                        id="colline"
                        name="colline"
                        value={cptDossier.colline}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="avenue">Avenue</label>
                    <InputText
                        id="avenue"
                        name="avenue"
                        value={cptDossier.avenue}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="tel">Téléphone</label>
                    <InputText
                        id="tel"
                        name="tel"
                        value={cptDossier.tel}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="fax">Fax</label>
                    <InputText
                        id="fax"
                        name="fax"
                        value={cptDossier.fax}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="email">Email</label>
                    <InputText
                        id="email"
                        name="email"
                        type="email"
                        value={cptDossier.email}
                        onChange={handleChange}
                    />
                </div>

                {/* Informations Fiscales */}
                <div className="field col-12">
                    <h5>Informations Fiscales</h5>
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="centreFiscale">Centre Fiscal</label>
                    <InputText
                        id="centreFiscale"
                        name="centreFiscale"
                        value={cptDossier.centreFiscale}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="tauxTVA">Taux TVA (%)</label>
                    <InputNumber
                        id="tauxTVA"
                        value={cptDossier.tauxTVA}
                        onValueChange={(e) => handleNumberChange('tauxTVA', e.value)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        suffix="%"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="compteTVA">Compte TVA</label>
                    <InputText
                        id="compteTVA"
                        name="compteTVA"
                        value={cptDossier.compteTVA}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="assujetiTVA"
                            name="assujetiTVA"
                            checked={cptDossier.assujetiTVA}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="assujetiTVA" className="ml-2">Assujeti à la TVA</label>
                    </div>
                </div>

                <div className="field col-12 md:col-4">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="assujetiTC"
                            name="assujetiTC"
                            checked={cptDossier.assujetiTC}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="assujetiTC" className="ml-2">Assujeti à la TC</label>
                    </div>
                </div>

                <div className="field col-12 md:col-4">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="assujetiPF"
                            name="assujetiPF"
                            checked={cptDossier.assujetiPF}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="assujetiPF" className="ml-2">Assujeti au PF</label>
                    </div>
                </div>

                {/* Paramètres Comptables */}
                <div className="field col-12">
                    <h5>Paramètres Comptables</h5>
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="longueurCpte">Longueur de Compte</label>
                    <InputNumber
                        id="longueurCpte"
                        value={cptDossier.longueurCpte}
                        onValueChange={(e) => handleNumberChange('longueurCpte', e.value)}
                        showButtons
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dernierDateAmmo">Dernière Date Ammo</label>
                    <Calendar
                        id="dernierDateAmmo"
                        value={cptDossier.dernierDateAmmo}
                        onChange={(e) => handleDateChange('dernierDateAmmo', e.value as Date | null)}
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="axe1">Axe 1</label>
                    <InputText
                        id="axe1"
                        name="axe1"
                        value={cptDossier.axe1}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="axe2">Axe 2</label>
                    <InputText
                        id="axe2"
                        name="axe2"
                        value={cptDossier.axe2}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-2">
                    <label htmlFor="axe3">Axe 3</label>
                    <InputText
                        id="axe3"
                        name="axe3"
                        value={cptDossier.axe3}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="userName">Nom d&apos;Utilisateur</label>
                    <InputText
                        id="userName"
                        name="userName"
                        value={cptDossier.userName}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default CptDossierForm;
