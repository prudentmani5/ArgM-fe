'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Client, ClientType, Gender, RiskRating, Province, Commune, Zone, Colline, Nationality, IdDocumentType, ActivitySector, MaritalStatus, EducationLevel, ClientCategory, HousingType, Branch } from "./Client";

interface ClientFormProps {
    client: Client;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleFileUpload: (fieldName: string, file: File) => void;
    handleFileRemove: (fieldName: string) => void;
    idDocumentFile: File | null;
    photoFile: File | null;
    provinces: Province[];
    communes: Commune[];
    zones: Zone[];
    collines: Colline[];
    nationalities: Nationality[];
    idDocumentTypes: IdDocumentType[];
    activitySectors: ActivitySector[];
    maritalStatuses: MaritalStatus[];
    educationLevels: EducationLevel[];
    clientCategories: ClientCategory[];
    housingTypes: HousingType[];
    branches: Branch[];
    onProvinceChange: (provinceId: number) => void;
    onCommuneChange: (communeId: number) => void;
    onZoneChange: (zoneId: number) => void;
    onDocumentNumberBlur?: () => void;
    documentNumberError?: string | null;
    checkingDocument?: boolean;
}

const clientTypeOptions = [
    { label: 'Individuel', value: ClientType.INDIVIDUAL },
    { label: 'Entreprise', value: ClientType.BUSINESS }
];

const genderOptions = [
    { label: 'Masculin', value: Gender.M },
    { label: 'Féminin', value: Gender.F }
];

const riskRatingOptions = [
    { label: 'Faible', value: RiskRating.LOW },
    { label: 'Moyen', value: RiskRating.MEDIUM },
    { label: 'Elevé', value: RiskRating.HIGH },
    { label: 'Très élevé', value: RiskRating.VERY_HIGH }
];

const ClientForm: React.FC<ClientFormProps> = ({
    client,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    handleFileUpload,
    handleFileRemove,
    idDocumentFile,
    photoFile,
    provinces,
    communes,
    zones,
    collines,
    nationalities,
    idDocumentTypes,
    activitySectors,
    maritalStatuses,
    educationLevels,
    clientCategories,
    housingTypes,
    branches,
    onProvinceChange,
    onCommuneChange,
    onZoneChange,
    onDocumentNumberBlur,
    documentNumberError,
    checkingDocument
}) => {
    return (
        <div className="card p-fluid">
            {/* Type de Client */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-user mr-2"></i>
                    Type de Client
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="clientType" className="font-bold">Type <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="clientType"
                            value={client.clientType}
                            options={clientTypeOptions}
                            onChange={(e) => handleDropdownChange('clientType', e.value)}
                            placeholder="Sélectionner le type"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="clientNumber" className="font-bold">Numéro du compte</label>
                        <InputText
                            id="clientNumber"
                            value={client.clientNumber}
                            onChange={handleChange}
                            name="clientNumber"
                            disabled
                            placeholder="Généré automatiquement"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="branchId" className="font-bold">Agence <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="branchId"
                            value={client.branchId}
                            options={branches}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            placeholder="Sélectionner l'agence"
                            filter
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Informations Personnelles (Individual) */}
            {client.clientType === ClientType.INDIVIDUAL && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-id-card mr-2"></i>
                        Informations Personnelles
                    </h5>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="lastName" className="font-bold">Nom <span className="text-red-500">*</span></label>
                            <InputText
                                id="lastName"
                                value={client.lastName}
                                onChange={handleChange}
                                name="lastName"
                                placeholder="Entrer le nom"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="firstName" className="font-bold">Prénom <span className="text-red-500">*</span></label>
                            <InputText
                                id="firstName"
                                value={client.firstName}
                                onChange={handleChange}
                                name="firstName"
                                placeholder="Entrer le prénom"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="middleName">Deuxième Prénom</label>
                            <InputText
                                id="middleName"
                                value={client.middleName}
                                onChange={handleChange}
                                name="middleName"
                                placeholder="Entrer le deuxième prénom"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="gender" className="font-bold">Genre <span className="text-red-500">*</span></label>
                            <Dropdown
                                id="gender"
                                value={client.gender}
                                options={genderOptions}
                                onChange={(e) => handleDropdownChange('gender', e.value)}
                                placeholder="Sélectionner"
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="dateOfBirth" className="font-bold">Date de Naissance <span className="text-red-500">*</span></label>
                            <Calendar
                                id="dateOfBirth"
                                value={client.dateOfBirth ? new Date(client.dateOfBirth) : null}
                                onChange={(e) => handleDateChange('dateOfBirth', e.value as Date | null)}
                                dateFormat="dd/mm/yy"
                                showIcon
                                placeholder="JJ/MM/AAAA"
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="placeOfBirth">Lieu de Naissance</label>
                            <InputText
                                id="placeOfBirth"
                                value={client.placeOfBirth}
                                onChange={handleChange}
                                name="placeOfBirth"
                                placeholder="Lieu de naissance"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nationalityId" className="font-bold">Nationalité <span className="text-red-500">*</span></label>
                            <Dropdown
                                id="nationalityId"
                                value={client.nationalityId}
                                options={nationalities}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => handleDropdownChange('nationalityId', e.value)}
                                placeholder="Sélectionner"
                                filter
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="maritalStatusId">Etat Civil</label>
                            <Dropdown
                                id="maritalStatusId"
                                value={client.maritalStatusId}
                                options={maritalStatuses}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => handleDropdownChange('maritalStatusId', e.value)}
                                placeholder="Sélectionner"
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="educationLevelId">Niveau d'Etude</label>
                            <Dropdown
                                id="educationLevelId"
                                value={client.educationLevelId}
                                options={educationLevels}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => handleDropdownChange('educationLevelId', e.value)}
                                placeholder="Sélectionner"
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="numberOfDependents">Nombre de Personnes à Charge</label>
                            <InputNumber
                                id="numberOfDependents"
                                value={client.numberOfDependents ?? client.dependentsCount ?? 0}
                                onValueChange={(e) => handleNumberChange('numberOfDependents', e.value ?? 0)}
                                min={0}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="housingTypeId">Type d'Habitation</label>
                            <Dropdown
                                id="housingTypeId"
                                value={client.housingTypeId}
                                options={housingTypes}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => handleDropdownChange('housingTypeId', e.value)}
                                placeholder="Sélectionner"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Informations Business */}
            {client.clientType === ClientType.BUSINESS && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-building mr-2"></i>
                        Informations Entreprise
                    </h5>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="businessName" className="font-bold">Nom de l'Entreprise <span className="text-red-500">*</span></label>
                            <InputText
                                id="businessName"
                                value={client.businessName}
                                onChange={handleChange}
                                name="businessName"
                                placeholder="Entrer le nom de l'entreprise"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="businessRegistrationNumber" className="font-bold">Numéro RCCM <span className="text-red-500">*</span></label>
                            <InputText
                                id="businessRegistrationNumber"
                                value={client.businessRegistrationNumber}
                                onChange={handleChange}
                                name="businessRegistrationNumber"
                                placeholder="Numéro d'enregistrement"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="businessType">Type d'Entreprise</label>
                            <InputText
                                id="businessType"
                                value={client.businessType}
                                onChange={handleChange}
                                name="businessType"
                                placeholder="SARL, SA, etc."
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="dateOfIncorporation">Date de Création</label>
                            <Calendar
                                id="dateOfIncorporation"
                                value={client.dateOfIncorporation ? new Date(client.dateOfIncorporation) : null}
                                onChange={(e) => handleDateChange('dateOfIncorporation', e.value as Date | null)}
                                dateFormat="dd/mm/yy"
                                showIcon
                                placeholder="JJ/MM/AAAA"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Document d'Identité */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-credit-card mr-2"></i>
                    Document d'Identité
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idDocumentTypeId" className="font-bold">Type de Document <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="idDocumentTypeId"
                            value={client.idDocumentTypeId}
                            options={idDocumentTypes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('idDocumentTypeId', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idDocumentNumber" className="font-bold">Numéro du Document <span className="text-red-500">*</span></label>
                        <div className="p-inputgroup">
                            <InputText
                                id="idDocumentNumber"
                                value={client.idDocumentNumber}
                                onChange={handleChange}
                                onBlur={onDocumentNumberBlur}
                                name="idDocumentNumber"
                                placeholder="Numéro du document"
                                className={documentNumberError ? 'p-invalid' : ''}
                            />
                            {checkingDocument && (
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-spin pi-spinner"></i>
                                </span>
                            )}
                        </div>
                        {documentNumberError && (
                            <small className="p-error">{documentNumberError}</small>
                        )}
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idDocumentIssueDate">Date de Délivrance</label>
                        <Calendar
                            id="idDocumentIssueDate"
                            value={(client.idDocumentIssueDate || client.idIssueDate) ? new Date(client.idDocumentIssueDate || client.idIssueDate!) : null}
                            onChange={(e) => handleDateChange('idDocumentIssueDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="JJ/MM/AAAA"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idDocumentExpiryDate">Date d'Expiration</label>
                        <Calendar
                            id="idDocumentExpiryDate"
                            value={(client.idDocumentExpiryDate || client.idExpiryDate) ? new Date(client.idDocumentExpiryDate || client.idExpiryDate!) : null}
                            onChange={(e) => handleDateChange('idDocumentExpiryDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="JJ/MM/AAAA"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="idDocumentIssuedBy">Délivré par</label>
                        <InputText
                            id="idDocumentIssuedBy"
                            value={client.idDocumentIssuedBy || client.idIssuePlace || ''}
                            onChange={handleChange}
                            name="idDocumentIssuedBy"
                            placeholder="Autorité de délivrance"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="idDocumentScan">Document Scanné</label>
                        <FileUpload
                            id="idDocumentScan"
                            mode="basic"
                            name="idDocumentScan"
                            accept="image/*,.pdf"
                            maxFileSize={5000000}
                            chooseLabel={idDocumentFile ? idDocumentFile.name : "Choisir un fichier"}
                            onSelect={(e) => {
                                if (e.files && e.files.length > 0) {
                                    handleFileUpload('idDocumentScanPath', e.files[0]);
                                }
                            }}
                            onClear={() => handleFileRemove('idDocumentScanPath')}
                            className="w-full"
                        />
                        {client.idDocumentScanPath && !idDocumentFile && (
                            <small className="text-green-600 block mt-1">
                                <i className="pi pi-check mr-1"></i>
                                Fichier existant: {client.idDocumentScanPath.split('/').pop()}
                            </small>
                        )}
                        {idDocumentFile && (
                            <small className="text-blue-600 block mt-1">
                                <i className="pi pi-file mr-1"></i>
                                Nouveau fichier: {idDocumentFile.name}
                            </small>
                        )}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientPhoto">Photo du Client</label>
                        <FileUpload
                            id="clientPhoto"
                            mode="basic"
                            name="clientPhoto"
                            accept="image/*"
                            maxFileSize={2000000}
                            chooseLabel={photoFile ? photoFile.name : "Choisir une photo"}
                            onSelect={(e) => {
                                if (e.files && e.files.length > 0) {
                                    handleFileUpload('photoPath', e.files[0]);
                                }
                            }}
                            onClear={() => handleFileRemove('photoPath')}
                            className="w-full"
                        />
                        {client.photoPath && !photoFile && (
                            <div className="mt-2">
                                <Image
                                    src={client.photoPath}
                                    alt="Photo du client"
                                    width="80"
                                    preview
                                    imageClassName="border-round"
                                />
                            </div>
                        )}
                        {photoFile && (
                            <div className="mt-2">
                                <Image
                                    src={URL.createObjectURL(photoFile)}
                                    alt="Nouvelle photo"
                                    width="80"
                                    preview
                                    imageClassName="border-round"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contacts */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-phone mr-2"></i>
                    Contacts
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="phonePrimary" className="font-bold">Téléphone Principal <span className="text-red-500">*</span></label>
                        <InputText
                            id="phonePrimary"
                            value={client.phonePrimary}
                            onChange={handleChange}
                            name="phonePrimary"
                            placeholder="+257 XX XXX XXX"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="phoneSecondary">Téléphone Secondaire</label>
                        <InputText
                            id="phoneSecondary"
                            value={client.phoneSecondary}
                            onChange={handleChange}
                            name="phoneSecondary"
                            placeholder="+257 XX XXX XXX"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="email">Email</label>
                        <InputText
                            id="email"
                            type="email"
                            value={client.email}
                            onChange={handleChange}
                            name="email"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>
            </div>

            {/* Adresse */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-map-marker mr-2"></i>
                    Adresse
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="provinceId" className="font-bold">Province <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="provinceId"
                            value={client.provinceId}
                            options={provinces}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => {
                                handleDropdownChange('provinceId', e.value);
                                onProvinceChange(e.value);
                            }}
                            placeholder="Sélectionner"
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="communeId" className="font-bold">Commune <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="communeId"
                            value={client.communeId}
                            options={communes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => {
                                handleDropdownChange('communeId', e.value);
                                onCommuneChange(e.value);
                            }}
                            placeholder="Sélectionner"
                            filter
                            disabled={!client.provinceId}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="zoneId">Zone</label>
                        <Dropdown
                            id="zoneId"
                            value={client.zoneId}
                            options={zones}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => {
                                handleDropdownChange('zoneId', e.value);
                                onZoneChange(e.value);
                            }}
                            placeholder="Sélectionner"
                            filter
                            disabled={!client.communeId}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="collineId">Colline</label>
                        <Dropdown
                            id="collineId"
                            value={client.collineId}
                            options={collines}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('collineId', e.value)}
                            placeholder="Sélectionner"
                            filter
                            disabled={!client.zoneId}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="streetAddress">Adresse Détaillée</label>
                        <InputText
                            id="streetAddress"
                            value={client.streetAddress}
                            onChange={handleChange}
                            name="streetAddress"
                            placeholder="Quartier, Avenue, Numéro..."
                        />
                    </div>
                </div>
            </div>

            {/* Activité Professionnelle */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-briefcase mr-2"></i>
                    Activité Professionnelle
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="activitySectorId">Secteur d'Activité</label>
                        <Dropdown
                            id="activitySectorId"
                            value={client.activitySectorId}
                            options={activitySectors}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('activitySectorId', e.value)}
                            placeholder="Sélectionner"
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="occupation">Profession/Occupation</label>
                        <InputText
                            id="occupation"
                            value={client.occupation || client.profession || ''}
                            onChange={handleChange}
                            name="occupation"
                            placeholder="Profession"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="employer">Employeur</label>
                        <InputText
                            id="employer"
                            value={client.employer || client.employerName || ''}
                            onChange={handleChange}
                            name="employer"
                            placeholder="Nom de l'employeur"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="monthlyIncome">Revenu Mensuel (BIF)</label>
                        <InputNumber
                            id="monthlyIncome"
                            value={client.monthlyIncome}
                            onValueChange={(e) => handleNumberChange('monthlyIncome', e.value ?? 0)}
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Classification & Risque */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-chart-bar mr-2"></i>
                    Classification & Risque
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientCategoryId">Catégorie Client <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="clientCategoryId"
                            value={client.clientCategoryId}
                            options={clientCategories}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('clientCategoryId', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="riskRating">Niveau de Risque</label>
                        <Dropdown
                            id="riskRating"
                            value={client.riskRating}
                            options={riskRatingOptions}
                            onChange={(e) => handleDropdownChange('riskRating', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-file-edit mr-2"></i>
                    Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <InputTextarea
                            id="notes"
                            value={client.notes}
                            onChange={handleChange}
                            name="notes"
                            rows={3}
                            placeholder="Notes ou observations..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientForm;
