'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import {
    DossierRecouvrement,
    STATUTS_DOSSIER_RECOUVREMENT,
    ETAPES_RECOUVREMENT,
    PRIORITES,
    TYPES_ACTION_RECOUVREMENT
} from '../types/RemboursementTypes';

interface DossierRecouvrementFormProps {
    dossier: DossierRecouvrement;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleCheckboxChange: (name: string, value: boolean) => void;
    agents?: any[];
    isViewMode?: boolean;
}

export default function DossierRecouvrementForm({
    dossier,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    handleCheckboxChange,
    agents = [],
    isViewMode = false
}: DossierRecouvrementFormProps) {
    return (
        <div className="grid">
            {/* Section Informations Générales */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-folder-open mr-2"></i>
                        Informations du Dossier
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="caseNumber" className="font-semibold">
                                N° Dossier
                            </label>
                            <InputText
                                id="caseNumber"
                                name="caseNumber"
                                value={dossier.caseNumber || ''}
                                onChange={handleChange}
                                className="w-full"
                                disabled={true}
                                placeholder="Généré automatiquement"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="applicationNumber" className="font-semibold">
                                N° Dossier Crédit *
                            </label>
                            <InputText
                                id="applicationNumber"
                                name="applicationNumber"
                                value={dossier.applicationNumber || ''}
                                className="w-full"
                                disabled={true}
                                placeholder="Sélectionner un crédit..."
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="openedDate" className="font-semibold">
                                Date d'Ouverture *
                            </label>
                            <Calendar
                                id="openedDate"
                                value={dossier.openedDate ? new Date(dossier.openedDate) : null}
                                onChange={(e) => handleDateChange('openedDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="status" className="font-semibold">
                                Statut
                            </label>
                            <Dropdown
                                id="status"
                                value={dossier.status}
                                options={STATUTS_DOSSIER_RECOUVREMENT}
                                onChange={(e) => handleDropdownChange('status', e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner..."
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="currentStage" className="font-semibold">
                                Étape Actuelle
                            </label>
                            <Dropdown
                                id="currentStage"
                                value={dossier.currentStage}
                                options={ETAPES_RECOUVREMENT}
                                onChange={(e) => handleDropdownChange('currentStage', e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner..."
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="priority" className="font-semibold">
                                Priorité
                            </label>
                            <Dropdown
                                id="priority"
                                value={dossier.priority}
                                options={PRIORITES}
                                onChange={(e) => handleDropdownChange('priority', e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner..."
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="userAction" className="font-semibold">
                                Assigné à (Utilisateur)
                            </label>
                            <InputText
                                id="userAction"
                                name="userAction"
                                value={dossier.userAction || ''}
                                className="w-full"
                                disabled={true}
                                placeholder="Utilisateur connecté"
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="currentDaysOverdue" className="font-semibold text-red-500">
                                Jours de Retard
                            </label>
                            <InputNumber
                                id="currentDaysOverdue"
                                value={dossier.currentDaysOverdue || null}
                                onValueChange={(e) => handleNumberChange('currentDaysOverdue', e.value ?? null)}
                                className="w-full"
                                disabled={true}
                                suffix=" jours"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Montants */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-money-bill mr-2"></i>
                        Montants Impayés
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="currentTotalOverdue" className="font-semibold text-red-500">
                                Montant Total Impayé (FBU)
                            </label>
                            <InputNumber
                                id="currentTotalOverdue"
                                value={dossier.currentTotalOverdue || null}
                                onValueChange={(e) => handleNumberChange('currentTotalOverdue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="penaltiesOverdue" className="font-semibold text-orange-500">
                                Total Pénalités (FBU)
                            </label>
                            <InputNumber
                                id="penaltiesOverdue"
                                value={dossier.penaltiesOverdue || null}
                                onValueChange={(e) => handleNumberChange('penaltiesOverdue', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="promiseToPayAmount" className="font-semibold text-blue-500">
                                Promesse de Paiement (FBU)
                            </label>
                            <InputNumber
                                id="promiseToPayAmount"
                                value={dossier.promiseToPayAmount || null}
                                onValueChange={(e) => handleNumberChange('promiseToPayAmount', e.value ?? null)}
                                className="w-full"
                                disabled={isViewMode}
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Suivi */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-clock mr-2"></i>
                        Suivi et Actions
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="lastContactDate" className="font-semibold">
                                Date Dernier Contact
                            </label>
                            <Calendar
                                id="lastContactDate"
                                value={dossier.lastContactDate ? new Date(dossier.lastContactDate) : null}
                                onChange={(e) => handleDateChange('lastContactDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="nextActionDate" className="font-semibold">
                                Date Prochaine Action
                            </label>
                            <Calendar
                                id="nextActionDate"
                                value={dossier.nextActionDate ? new Date(dossier.nextActionDate) : null}
                                onChange={(e) => handleDateChange('nextActionDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="nextActionType" className="font-semibold">
                                Type Prochaine Action
                            </label>
                            <Dropdown
                                id="nextActionType"
                                value={dossier.nextActionType}
                                options={TYPES_ACTION_RECOUVREMENT}
                                onChange={(e) => handleDropdownChange('nextActionType', e.value)}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Sélectionner..."
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="promiseToPayDate" className="font-semibold">
                                Date Promesse de Paiement
                            </label>
                            <Calendar
                                id="promiseToPayDate"
                                value={dossier.promiseToPayDate ? new Date(dossier.promiseToPayDate) : null}
                                onChange={(e) => handleDateChange('promiseToPayDate', e.value as Date)}
                                className="w-full"
                                disabled={isViewMode}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Escalade */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-arrow-up mr-2"></i>
                        Escalade
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-2 flex align-items-center">
                            <Checkbox
                                inputId="isEscalated"
                                checked={dossier.isEscalated || false}
                                onChange={(e) => handleCheckboxChange('isEscalated', e.checked ?? false)}
                                disabled={isViewMode}
                            />
                            <label htmlFor="isEscalated" className="ml-2 font-semibold">
                                Dossier Escaladé
                            </label>
                        </div>

                        {dossier.isEscalated && (
                            <>
                                <div className="field col-12 md:col-3">
                                    <label htmlFor="escalatedTo" className="font-semibold">
                                        Escaladé à
                                    </label>
                                    <Dropdown
                                        id="escalatedTo"
                                        value={dossier.escalatedTo}
                                        options={agents}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={(e) => handleDropdownChange('escalatedTo', e.value)}
                                        className="w-full"
                                        disabled={isViewMode}
                                        placeholder="Sélectionner..."
                                    />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label htmlFor="escalationDate" className="font-semibold">
                                        Date d'Escalade
                                    </label>
                                    <Calendar
                                        id="escalationDate"
                                        value={dossier.escalationDate ? new Date(dossier.escalationDate) : null}
                                        onChange={(e) => handleDateChange('escalationDate', e.value as Date)}
                                        className="w-full"
                                        disabled={isViewMode}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="escalationReason" className="font-semibold">
                                        Raison de l'Escalade
                                    </label>
                                    <InputText
                                        id="escalationReason"
                                        name="escalationReason"
                                        value={dossier.escalationReason || ''}
                                        onChange={handleChange}
                                        className="w-full"
                                        disabled={isViewMode}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Section Notes */}
            <div className="col-12">
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="mb-3">
                        <i className="pi pi-file-edit mr-2"></i>
                        Notes et Observations
                    </h5>

                    <div className="formgrid grid">
                        <div className="field col-12">
                            <InputTextarea
                                id="notes"
                                name="notes"
                                value={dossier.notes || ''}
                                onChange={handleChange}
                                className="w-full"
                                disabled={isViewMode}
                                rows={4}
                                placeholder="Notes sur le dossier de recouvrement..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
