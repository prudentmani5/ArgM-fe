'use client'

import React from "react";
import { GrhRensIdentification } from "./GrhRensIdentification";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Situation } from "../../settings/situation/Situation";
import { Pays } from "../../settings/pays/Pays";
import { Banque } from "../../settings/banque/Banque";
import { Province } from "../../settings/province/Province";
import { Commune } from "../../settings/commune/Commune";
import { Colline } from "../../settings/colline/Colline";

interface GrhFormProps {
    employee: GrhRensIdentification;
    situations: Situation[];
    pays: Pays[];
    banques: Banque[];
    provinces: Province[];
    communes: Commune[];
    collines: Colline[];
    selectedSituation: Situation | null;
    selectedPays: Pays | null;
    selectedBanque: Banque | null;
    selectedBanque1: Banque | null;
    selectedProvince: Province | null;
    selectedCommune: Commune | null;
    selectedColline: Colline | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleCalendarChange: (e: CalendarChangeEvent) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    handleDateNaissanceBlur?: (date: Date | null) => void;
    handlePhotoSelect: (file: File) => void;
    handlePhotoRemove: () => void;
    photoPreview?: string;
    isEditMode?: boolean;
}

const GrhRensIdentificationForm: React.FC<GrhFormProps> = ({
    employee,
    situations,
    pays,
    banques,
    provinces,
    communes,
    collines,
    selectedSituation,
    selectedPays,
    selectedBanque,
    selectedBanque1,
    selectedProvince,
    selectedCommune,
    selectedColline,
    handleChange,
    handleDropDownSelect,
    handleCalendarChange,
    handleMatriculeBlur,
    handleDateNaissanceBlur,
    handlePhotoSelect,
    handlePhotoRemove,
    photoPreview,
    isEditMode = false
}) => {
    
    const sexeOptions = [
        { label: "Masculin", value: "M" },
        { label: "Féminin", value: "F" }
    ];

    const onPhotoUpload = (event: FileUploadHandlerEvent) => {
        const file = event.files[0];
        if (file) {
            handlePhotoSelect(file);
        }
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Photo Upload Section */}
                <div className="field col-12 md:col-12">
                    <label htmlFor="photo">Photo de l'employé</label>
                    <div className="flex align-items-center gap-3">
                        {photoPreview && (
                            <div className="relative">
                                <img
                                    src={photoPreview}
                                    alt="Photo employé"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '2px solid #dee2e6'
                                    }}
                                />
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-rounded p-button-danger p-button-sm"
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        width: '30px',
                                        height: '30px'
                                    }}
                                    onClick={handlePhotoRemove}
                                    type="button"
                                />
                            </div>
                        )}
                        <FileUpload
                            mode="basic"
                            name="photo"
                            accept="image/*"
                            maxFileSize={5000000}
                            customUpload
                            uploadHandler={onPhotoUpload}
                            auto
                            chooseLabel="Choisir une photo"
                            className="p-button-outlined"
                        />
                    </div>
                    <small className="text-muted">Formats acceptés: JPG, PNG, GIF (Max 5MB)</small>
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <InputText 
                        id="matriculeId" 
                        name="matriculeId" 
                        value={employee.matriculeId} 
                        onChange={handleChange} 
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        required 
                        disabled={isEditMode}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="ancienId">Ancien Matricule</label>
                    <InputText 
                        id="ancienId" 
                        name="ancienId" 
                        value={employee.ancienId} 
                        onChange={handleChange} 
                        readOnly
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="nom">Nom *</label>
                    <InputText id="nom" name="nom" value={employee.nom} onChange={handleChange} required />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="prenom">Prénom *</label>
                    <InputText id="prenom" name="prenom" value={employee.prenom} onChange={handleChange} required />
                </div>
                
                {/* ... rest of the form fields remain the same ... */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="sexe">Genre *</label>
                    <Dropdown
                        name="sexe"
                        value={employee.sexe}
                        options={sexeOptions}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner le genre"
                        required
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateNaissance">Date de naissance *</label>
                    <Calendar
                        id="dateNaissance"
                        name="dateNaissanceTemp"
                        value={employee.dateNaissanceTemp}
                        onChange={(e) => {
                            handleCalendarChange(e);
                            // Trigger calculation after the date is set
                            if (handleDateNaissanceBlur && e.value) {
                                handleDateNaissanceBlur(e.value as Date);
                            }
                        }}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="Sélectionner la date"
                        required
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="paysId">Pays de Naissance *</label>
                    <Dropdown
                        name="paysId"
                        value={employee.paysId}
                        options={pays}
                        optionLabel="nomPays"
                        optionValue="paysId"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner le pays"
                        required
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="villeNaissance">Ville de Naissance</label>
                    <InputText id="villeNaissance" name="villeNaissance" value={employee.villeNaissance} onChange={handleChange} />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="provinceId">Province de Naissance</label>
                    <Dropdown
                        name="provinceId"
                        value={selectedProvince?.provinceId}
                        options={provinces}
                        optionLabel="nom"
                        optionValue="provinceId"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner la province"
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="communeId">Commune de Naissance</label>
                    <Dropdown
                        name="communeId"
                        value={selectedCommune?.communeId}
                        options={communes}
                        optionLabel="nom"
                        optionValue="communeId"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner la commune"
                        disabled={!selectedProvince}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="collineId">Colline de Naissance *</label>
                    <Dropdown
                        name="collineId"
                        value={employee.collineId}
                        options={collines}
                        optionLabel="nom"
                        optionValue="collineId"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner la colline"
                        disabled={!selectedCommune}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="situationId">Situation *</label>
                    <Dropdown
                        name="situationId"
                        value={employee.situationId}
                        options={situations}
                        optionLabel="libelle"
                        optionValue="situationId"
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner la situation"
                        required
                    />
                </div>
                
                
                
                
                
                
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="cin">CNI (Carte Nationale d'Identité) *</label>
                    <InputText id="cin" name="cin" value={employee.cin} onChange={handleChange} required />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="passeport">Passeport</label>
                    <InputText id="passeport" name="passeport" value={employee.passeport} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="permis">Permis</label>
                    <InputText id="permis" name="permis" value={employee.permis} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="numINSS">Numéro INSS</label>
                    <InputText id="numINSS" name="numINSS" value={employee.numINSS} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="numMFP">Numéro MFP</label>
                    <InputText id="numMFP" name="numMFP" value={employee.numMFP} onChange={handleChange} />
                </div>
                
                
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="pere">Père</label>
                    <InputText id="pere" name="pere" value={employee.pere} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="mere">Mère</label>
                    <InputText id="mere" name="mere" value={employee.mere} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="anneeRetraite">Année Retraite</label>
                    <InputText id="anneeRetraite" name="anneeRetraite" readOnly value={employee.anneeRetraite} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="codeBanque">Banque Principale</label>
                    <Dropdown 
                        name="codeBanque" 
                        value={employee.codeBanque} 
                        options={banques} 
                        optionLabel="libelleBanque" 
                        optionValue="codeBanque" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner la banque"
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="compte">Compte Principal</label>
                    <InputText id="compte" name="compte" value={employee.compte} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="codeBanque1">Banque Secondaire</label>
                    <Dropdown 
                        name="codeBanque1" 
                        value={employee.codeBanque1} 
                        options={banques} 
                        optionLabel="libelleBanque" 
                        optionValue="codeBanque" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner la banque secondaire"
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="compte1">Compte Secondaire</label>
                    <InputText id="compte1" name="compte1" value={employee.compte1} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateSituation">Date Situation</label>
                    <Calendar 
                        id="dateSituation" 
                        name="dateSituation" 
                        value={employee.dateSituation} 
                        onChange={handleCalendarChange} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="causeSituation">Cause Situation</label>
                    <InputText id="causeSituation" name="causeSituation" value={employee.causeSituation} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="ancienId">Ancien ID</label>
                    <InputText id="ancienId" name="ancienId" value={employee.ancienId} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="nouveauId">Nouveau ID</label>
                    <InputText id="nouveauId" name="nouveauId" value={employee.nouveauId} onChange={handleChange} />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="photoId">Photo ID</label>
                    <InputText id="photoId" name="photoId" value={employee.photoId} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
};

export default GrhRensIdentificationForm;