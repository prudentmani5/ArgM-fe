'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Checkbox } from "primereact/checkbox";
import { SignatoryMember, FUNCTION_ROLE_OPTIONS } from "./SignatoryMember";
import { API_BASE_URL } from '@/utils/apiConfig';

interface SignatoryMemberFormProps {
    member: SignatoryMember;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleFileUpload: (fieldName: string, file: File) => void;
    handleFileRemove: (fieldName: string) => void;
    signatureFile: File | null;
    photoFile: File | null;
    idDocumentFile: File | null;
    idDocumentTypes: any[];
    relationshipTypes?: any[];
    isViewMode?: boolean;
}

const SignatoryMemberForm: React.FC<SignatoryMemberFormProps> = ({
    member,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleFileUpload,
    handleFileRemove,
    signatureFile,
    photoFile,
    idDocumentFile,
    idDocumentTypes,
    relationshipTypes = [],
    isViewMode = false
}) => {

    const getFilePreviewUrl = (file: File | null) => {
        if (file) return URL.createObjectURL(file);
        return null;
    };

    const getServerImageUrl = (path: string | undefined) => {
        if (!path) return null;
        return `${API_BASE_URL}/api/files/download?filePath=${encodeURIComponent(path)}`;
    };

    return (
        <div className="card p-fluid">
            {/* Identite du Membre */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-user mr-2"></i>
                    Identite du Membre
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="lastName" className="font-bold">Nom <span className="text-red-500">*</span></label>
                        <InputText
                            id="lastName"
                            value={member.lastName}
                            onChange={handleChange}
                            name="lastName"
                            placeholder="Entrer le nom"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="firstName" className="font-bold">Prenom <span className="text-red-500">*</span></label>
                        <InputText
                            id="firstName"
                            value={member.firstName}
                            onChange={handleChange}
                            name="firstName"
                            placeholder="Entrer le prenom"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="functionRole" className="font-bold">Fonction <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="functionRole"
                            value={member.functionRole}
                            options={FUNCTION_ROLE_OPTIONS}
                            onChange={(e) => handleDropdownChange('functionRole', e.value)}
                            placeholder="Selectionner la fonction"
                            className="w-full"
                            disabled={isViewMode}
                        />
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-phone mr-2"></i>
                    Contact
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="phonePrimary">Telephone Principal</label>
                        <InputText
                            id="phonePrimary"
                            value={member.phonePrimary}
                            onChange={handleChange}
                            name="phonePrimary"
                            placeholder="+257 XX XXX XXX"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="phoneSecondary">Telephone Secondaire</label>
                        <InputText
                            id="phoneSecondary"
                            value={member.phoneSecondary}
                            onChange={handleChange}
                            name="phoneSecondary"
                            placeholder="+257 XX XXX XXX"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="email">Email</label>
                        <InputText
                            id="email"
                            value={member.email}
                            onChange={handleChange}
                            name="email"
                            placeholder="email@exemple.com"
                            disabled={isViewMode}
                        />
                    </div>
                </div>
            </div>

            {/* Document d'Identite */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-id-card mr-2"></i>
                    Document d'Identite
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idDocumentTypeId">Type de Document</label>
                        <Dropdown
                            id="idDocumentTypeId"
                            value={member.idDocumentTypeId}
                            options={idDocumentTypes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('idDocumentTypeId', e.value)}
                            placeholder="Selectionner"
                            filter
                            className="w-full"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idDocumentNumber">Numero du Document</label>
                        <InputText
                            id="idDocumentNumber"
                            value={member.idDocumentNumber}
                            onChange={handleChange}
                            name="idDocumentNumber"
                            placeholder="Numero du document"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idIssueDate">Date d'Emission</label>
                        <Calendar
                            id="idIssueDate"
                            value={member.idIssueDate ? new Date(member.idIssueDate) : null}
                            onChange={(e) => handleDateChange('idIssueDate', e.value as Date)}
                            dateFormat="dd/mm/yy"
                            placeholder="JJ/MM/AAAA"
                            showIcon
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="idExpiryDate">Date d'Expiration</label>
                        <Calendar
                            id="idExpiryDate"
                            value={member.idExpiryDate ? new Date(member.idExpiryDate) : null}
                            onChange={(e) => handleDateChange('idExpiryDate', e.value as Date)}
                            dateFormat="dd/mm/yy"
                            placeholder="JJ/MM/AAAA"
                            showIcon
                            disabled={isViewMode}
                        />
                    </div>
                </div>
                {/* Document Scan Upload */}
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Document Scanne</label>
                        {!isViewMode && (
                            <FileUpload
                                mode="basic"
                                accept="image/*,.pdf"
                                maxFileSize={5000000}
                                chooseLabel="Choisir un document"
                                auto
                                customUpload
                                uploadHandler={(e: FileUploadHandlerEvent) => {
                                    if (e.files && e.files.length > 0) {
                                        handleFileUpload('idDocumentScanPath', e.files[0]);
                                    }
                                }}
                            />
                        )}
                        <div className="mt-2">
                            {idDocumentFile ? (
                                <div>
                                    {idDocumentFile.type.startsWith('image/') ? (
                                        <Image src={getFilePreviewUrl(idDocumentFile)!} alt="Document" width="120" preview />
                                    ) : (
                                        <span className="text-blue-600 text-sm">
                                            <i className="pi pi-file mr-1"></i>
                                            {idDocumentFile.name}
                                        </span>
                                    )}
                                </div>
                            ) : member.idDocumentScanPath ? (
                                <div>
                                    {member.idDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                        <Image src={getServerImageUrl(member.idDocumentScanPath)!} alt="Document" width="120" preview />
                                    ) : (
                                        <a href={getServerImageUrl(member.idDocumentScanPath)!} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                            <i className="pi pi-file-pdf mr-1"></i>
                                            Voir le document
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <span className="text-500 text-sm">Aucun document</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo & Signature */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-image mr-2"></i>
                    Photo & Signature
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Photo du Membre</label>
                        {!isViewMode && (
                            <FileUpload
                                mode="basic"
                                accept="image/*"
                                maxFileSize={2000000}
                                chooseLabel="Choisir une photo"
                                auto
                                customUpload
                                uploadHandler={(e: FileUploadHandlerEvent) => {
                                    if (e.files && e.files.length > 0) {
                                        handleFileUpload('photoPath', e.files[0]);
                                    }
                                }}
                            />
                        )}
                        <div className="mt-2">
                            {photoFile ? (
                                <Image src={getFilePreviewUrl(photoFile)!} alt="Photo" width="120" preview />
                            ) : member.photoPath ? (
                                <Image src={getServerImageUrl(member.photoPath)!} alt="Photo" width="120" preview />
                            ) : (
                                <span className="text-500 text-sm">Aucune photo</span>
                            )}
                        </div>
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Signature</label>
                        {!isViewMode && (
                            <FileUpload
                                mode="basic"
                                accept="image/*"
                                maxFileSize={2000000}
                                chooseLabel="Choisir une signature"
                                auto
                                customUpload
                                uploadHandler={(e: FileUploadHandlerEvent) => {
                                    if (e.files && e.files.length > 0) {
                                        handleFileUpload('signatureImagePath', e.files[0]);
                                    }
                                }}
                            />
                        )}
                        <div className="mt-2">
                            {signatureFile ? (
                                <Image src={getFilePreviewUrl(signatureFile)!} alt="Signature" width="120" preview />
                            ) : member.signatureImagePath ? (
                                <Image src={getServerImageUrl(member.signatureImagePath)!} alt="Signature" width="120" preview />
                            ) : (
                                <span className="text-500 text-sm">Aucune signature</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personne de Contact */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-phone mr-2"></i>
                    Personne de Contact
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="contactPersonName">Nom Complet</label>
                        <InputText
                            id="contactPersonName"
                            value={member.contactPersonName}
                            onChange={handleChange}
                            name="contactPersonName"
                            placeholder="Nom de la personne de contact"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="contactPersonRelationshipTypeId">Lien de Parenté</label>
                        <Dropdown
                            id="contactPersonRelationshipTypeId"
                            value={member.contactPersonRelationshipTypeId || member.contactPersonRelationshipType?.id}
                            options={relationshipTypes}
                            optionLabel="nameFr"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('contactPersonRelationshipTypeId', e.value)}
                            placeholder="Sélectionner"
                            showClear
                            className="w-full"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="contactPersonRelationshipOther">Autre (préciser)</label>
                        <InputText
                            id="contactPersonRelationshipOther"
                            value={member.contactPersonRelationshipOther}
                            onChange={handleChange}
                            name="contactPersonRelationshipOther"
                            placeholder="Si autre, préciser"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="contactPersonPhone">Téléphone Principal</label>
                        <InputText
                            id="contactPersonPhone"
                            value={member.contactPersonPhone}
                            onChange={handleChange}
                            name="contactPersonPhone"
                            placeholder="+257 ..."
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="contactPersonPhoneSecondary">Téléphone Secondaire</label>
                        <InputText
                            id="contactPersonPhoneSecondary"
                            value={member.contactPersonPhoneSecondary}
                            onChange={handleChange}
                            name="contactPersonPhoneSecondary"
                            placeholder="+257 ..."
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="contactPersonAddress">Adresse</label>
                        <InputText
                            id="contactPersonAddress"
                            value={member.contactPersonAddress}
                            onChange={handleChange}
                            name="contactPersonAddress"
                            placeholder="Adresse de la personne"
                            disabled={isViewMode}
                        />
                    </div>
                </div>
            </div>

            {/* Adresse & Notes */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-map-marker mr-2"></i>
                    Adresse & Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="address">Adresse</label>
                        <InputText
                            id="address"
                            value={member.address}
                            onChange={handleChange}
                            name="address"
                            placeholder="Adresse du membre"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="isActive">Statut</label>
                        <div className="flex align-items-center mt-2">
                            <Checkbox
                                inputId="isActive"
                                checked={member.isActive}
                                onChange={(e) => handleDropdownChange('isActive', e.checked)}
                                disabled={isViewMode}
                            />
                            <label htmlFor="isActive" className="ml-2">
                                {member.isActive ? 'Actif' : 'Inactif'}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="notes">Notes</label>
                        <InputTextarea
                            id="notes"
                            value={member.notes}
                            onChange={handleChange}
                            name="notes"
                            rows={3}
                            placeholder="Notes ou observations..."
                            disabled={isViewMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignatoryMemberForm;
