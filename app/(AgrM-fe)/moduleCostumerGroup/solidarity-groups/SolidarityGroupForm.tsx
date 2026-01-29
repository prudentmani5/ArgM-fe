'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { SolidarityGroup, MeetingFrequency, CohesionRating, GroupType, GuaranteeType, Province, Commune, Zone, ActivitySector, Branch } from "./SolidarityGroup";

interface SolidarityGroupFormProps {
    group: SolidarityGroup;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleTimeChange: (name: string, value: Date | null) => void;
    groupTypes: GroupType[];
    guaranteeTypes: GuaranteeType[];
    provinces: Province[];
    communes: Commune[];
    zones: Zone[];
    activitySectors: ActivitySector[];
    branches: Branch[];
    onProvinceChange: (provinceId: number) => void;
    onCommuneChange: (communeId: number) => void;
    // File upload props
    bylawsDocumentFile: File | null;
    handleFileUpload: (e: FileUploadSelectEvent) => void;
    handleFileRemove: () => void;
}

const meetingFrequencyOptions = [
    { label: 'Hebdomadaire', value: MeetingFrequency.WEEKLY },
    { label: 'Bimensuel', value: MeetingFrequency.BIWEEKLY },
    { label: 'Mensuel', value: MeetingFrequency.MONTHLY },
    { label: 'Personnalisé', value: MeetingFrequency.CUSTOM }
];

const meetingDayOptions = [
    { label: 'Lundi', value: 'MONDAY' },
    { label: 'Mardi', value: 'TUESDAY' },
    { label: 'Mercredi', value: 'WEDNESDAY' },
    { label: 'Jeudi', value: 'THURSDAY' },
    { label: 'Vendredi', value: 'FRIDAY' },
    { label: 'Samedi', value: 'SATURDAY' },
    { label: 'Dimanche', value: 'SUNDAY' }
];

const cohesionRatingOptions = [
    { label: 'Excellent', value: CohesionRating.EXCELLENT },
    { label: 'Bon', value: CohesionRating.GOOD },
    { label: 'Acceptable', value: CohesionRating.FAIR },
    { label: 'Faible', value: CohesionRating.POOR }
];

const SolidarityGroupForm: React.FC<SolidarityGroupFormProps> = ({
    group,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    handleTimeChange,
    groupTypes,
    guaranteeTypes,
    provinces,
    communes,
    zones,
    activitySectors,
    branches,
    onProvinceChange,
    onCommuneChange,
    bylawsDocumentFile,
    handleFileUpload,
    handleFileRemove
}) => {
    return (
        <div className="card p-fluid">
            {/* Informations Générales */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-users mr-2"></i>
                    Informations Générales
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="groupCode" className="font-bold">Code du Groupe</label>
                        <InputText
                            id="groupCode"
                            value={group.groupCode}
                            onChange={handleChange}
                            name="groupCode"
                            disabled
                            placeholder="Généré automatiquement"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="groupName" className="font-bold">Nom du Groupe <span className="text-red-500">*</span></label>
                        <InputText
                            id="groupName"
                            value={group.groupName}
                            onChange={handleChange}
                            name="groupName"
                            placeholder="Entrer le nom du groupe"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="groupTypeId" className="font-bold">Type de Groupe <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="groupTypeId"
                            value={group.groupTypeId}
                            options={groupTypes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('groupTypeId', e.value)}
                            placeholder="Sélectionner le type"
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="formationDate" className="font-bold">Date de Formation <span className="text-red-500">*</span></label>
                        <Calendar
                            id="formationDate"
                            value={group.formationDate ? new Date(group.formationDate) : null}
                            onChange={(e) => handleDateChange('formationDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="JJ/MM/AAAA"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="branchId" className="font-bold">Agence <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="branchId"
                            value={group.branchId}
                            options={branches}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            placeholder="Sélectionner l'agence"
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="primarySectorId">Secteur d'Activité Principal</label>
                        <Dropdown
                            id="primarySectorId"
                            value={group.primarySectorId}
                            options={activitySectors}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('primarySectorId', e.value)}
                            placeholder="Sélectionner"
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="groupDescription">Description du Groupe</label>
                        <InputTextarea
                            id="groupDescription"
                            value={group.groupDescription}
                            onChange={handleChange}
                            name="groupDescription"
                            rows={2}
                            placeholder="Description des activités du groupe..."
                        />
                    </div>
                </div>
            </div>

            {/* Localisation */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-map-marker mr-2"></i>
                    Localisation
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="provinceId" className="font-bold">Province <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="provinceId"
                            value={group.provinceId}
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
                    <div className="field col-12 md:col-4">
                        <label htmlFor="communeId" className="font-bold">Commune <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="communeId"
                            value={group.communeId}
                            options={communes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => {
                                handleDropdownChange('communeId', e.value);
                                onCommuneChange(e.value);
                            }}
                            placeholder="Sélectionner"
                            filter
                            disabled={!group.provinceId}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="zoneId">Zone</label>
                        <Dropdown
                            id="zoneId"
                            value={group.zoneId}
                            options={zones}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('zoneId', e.value)}
                            placeholder="Sélectionner"
                            filter
                            disabled={!group.communeId}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="meetingLocation">Lieu de Réunion</label>
                        <InputText
                            id="meetingLocation"
                            value={group.meetingLocation}
                            onChange={handleChange}
                            name="meetingLocation"
                            placeholder="Adresse ou point de repère du lieu de réunion"
                        />
                    </div>
                </div>
            </div>

            {/* Taille du Groupe */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-chart-bar mr-2"></i>
                    Taille du Groupe
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="minMembers">Nombre Minimum de Membres</label>
                        <InputNumber
                            id="minMembers"
                            value={group.minMembers}
                            onValueChange={(e) => handleNumberChange('minMembers', e.value ?? 0)}
                            min={3}
                            max={100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="maxMembers">Nombre Maximum de Membres</label>
                        <InputNumber
                            id="maxMembers"
                            value={group.maxMembers}
                            onValueChange={(e) => handleNumberChange('maxMembers', e.value ?? 0)}
                            min={3}
                            max={100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="currentMemberCount">Nombre Actuel de Membres</label>
                        <InputNumber
                            id="currentMemberCount"
                            value={group.currentMemberCount}
                            disabled
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Calendrier des Réunions */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-calendar mr-2"></i>
                    Calendrier des Réunions
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="meetingFrequency" className="font-bold">Fréquence</label>
                        <Dropdown
                            id="meetingFrequency"
                            value={group.meetingFrequency}
                            options={meetingFrequencyOptions}
                            onChange={(e) => handleDropdownChange('meetingFrequency', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="meetingDay">Jour de Réunion</label>
                        <Dropdown
                            id="meetingDay"
                            value={group.meetingDay}
                            options={meetingDayOptions}
                            onChange={(e) => handleDropdownChange('meetingDay', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="meetingTime">Heure de Réunion</label>
                        <Calendar
                            id="meetingTime"
                            value={group.meetingTime ? new Date(`2000-01-01T${group.meetingTime}`) : null}
                            onChange={(e) => handleTimeChange('meetingTime', e.value as Date | null)}
                            timeOnly
                            hourFormat="24"
                            showIcon
                            icon="pi pi-clock"
                            className="w-full"
                        />
                    </div>
                    {group.meetingFrequency === MeetingFrequency.CUSTOM && (
                        <div className="field col-12 md:col-3">
                            <label htmlFor="customMeetingSchedule">Calendrier Personnalisé</label>
                            <InputText
                                id="customMeetingSchedule"
                                value={group.customMeetingSchedule}
                                onChange={handleChange}
                                name="customMeetingSchedule"
                                placeholder="Ex: 1er et 3ème lundi"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Informations Financières */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-wallet mr-2"></i>
                    Informations Financières
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="membershipFee">Frais d'Adhésion (BIF)</label>
                        <InputNumber
                            id="membershipFee"
                            value={group.membershipFee}
                            onValueChange={(e) => handleNumberChange('membershipFee', e.value ?? 0)}
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="savingsTarget">Objectif d'Épargne (BIF)</label>
                        <InputNumber
                            id="savingsTarget"
                            value={group.savingsTarget}
                            onValueChange={(e) => handleNumberChange('savingsTarget', e.value ?? 0)}
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="collectiveSavingsBalance">Solde Épargne Collective (BIF)</label>
                        <InputNumber
                            id="collectiveSavingsBalance"
                            value={group.collectiveSavingsBalance}
                            disabled
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Garantie */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-shield mr-2"></i>
                    Garantie
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="guaranteeTypeId">Type de Garantie</label>
                        <Dropdown
                            id="guaranteeTypeId"
                            value={group.guaranteeTypeId}
                            options={guaranteeTypes}
                            optionLabel="name"
                            optionValue="id"
                            onChange={(e) => handleDropdownChange('guaranteeTypeId', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="guaranteeAmount">Montant de la Garantie (BIF)</label>
                        <InputNumber
                            id="guaranteeAmount"
                            value={group.guaranteeAmount}
                            onValueChange={(e) => handleNumberChange('guaranteeAmount', e.value ?? 0)}
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="guaranteeDescription">Description de la Garantie</label>
                        <InputText
                            id="guaranteeDescription"
                            value={group.guaranteeDescription}
                            onChange={handleChange}
                            name="guaranteeDescription"
                            placeholder="Description..."
                        />
                    </div>
                </div>
            </div>

            {/* Performance */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-chart-line mr-2"></i>
                    Performance
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="cohesionRating">Niveau de Cohésion</label>
                        <Dropdown
                            id="cohesionRating"
                            value={group.cohesionRating}
                            options={cohesionRatingOptions}
                            onChange={(e) => handleDropdownChange('cohesionRating', e.value)}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="averageAttendanceRate">Taux de Présence Moyen (%)</label>
                        <InputNumber
                            id="averageAttendanceRate"
                            value={group.averageAttendanceRate}
                            onValueChange={(e) => handleNumberChange('averageAttendanceRate', e.value ?? 0)}
                            suffix="%"
                            min={0}
                            max={100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="repaymentRate">Taux de Remboursement (%)</label>
                        <InputNumber
                            id="repaymentRate"
                            value={group.repaymentRate}
                            onValueChange={(e) => handleNumberChange('repaymentRate', e.value ?? 0)}
                            suffix="%"
                            min={0}
                            max={100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="lastPerformanceReview">Dernière Évaluation</label>
                        <Calendar
                            id="lastPerformanceReview"
                            value={group.lastPerformanceReview ? new Date(group.lastPerformanceReview) : null}
                            onChange={(e) => handleDateChange('lastPerformanceReview', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-file mr-2"></i>
                    Documents
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="bylawsDocument" className="font-bold">Statuts / Règlement Intérieur</label>
                        <div className="flex flex-column gap-2">
                            <FileUpload
                                mode="basic"
                                name="bylawsDocument"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                maxFileSize={5000000}
                                chooseLabel={bylawsDocumentFile ? bylawsDocumentFile.name : "Choisir un fichier"}
                                onSelect={handleFileUpload}
                                auto={false}
                                className="w-full"
                            />
                            {(bylawsDocumentFile || group.bylawsDocumentPath) && (
                                <div className="flex align-items-center gap-2 mt-2">
                                    <i className="pi pi-file text-primary"></i>
                                    <span className="text-sm">
                                        {bylawsDocumentFile ? bylawsDocumentFile.name : group.bylawsDocumentPath?.split('/').pop()}
                                    </span>
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-rounded p-button-danger p-button-text p-button-sm"
                                        onClick={handleFileRemove}
                                        type="button"
                                        tooltip="Supprimer le fichier"
                                    />
                                </div>
                            )}
                            <small className="text-muted">Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5 Mo)</small>
                        </div>
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
                            value={group.notes}
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

export default SolidarityGroupForm;
