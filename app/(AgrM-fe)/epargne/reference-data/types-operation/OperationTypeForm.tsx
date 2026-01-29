'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { OperationType, OperationClass } from './OperationType';

interface OperationTypeFormProps {
    operationType: OperationType;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
    handleNumberChange: (name: string, value: number | null) => void;
}

const OperationTypeForm: React.FC<OperationTypeFormProps> = ({
    operationType,
    handleChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleNumberChange
}) => {
    const operationClasses = [
        { label: 'Crédit (Entrée)', value: OperationClass.CREDIT },
        { label: 'Débit (Sortie)', value: OperationClass.DEBIT }
    ];

    return (
        <div className="card p-fluid">
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-cog mr-2"></i>
                    Informations du Type d'Opération
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="code" className="font-medium">Code *</label>
                        <InputText
                            id="code"
                            name="code"
                            value={operationType.code}
                            onChange={handleChange}
                            placeholder="Ex: DEP, RET, INT"
                            className="w-full"
                            required
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="name" className="font-medium">Nom (Anglais) *</label>
                        <InputText
                            id="name"
                            name="name"
                            value={operationType.name}
                            onChange={handleChange}
                            placeholder="Ex: Deposit, Withdrawal"
                            className="w-full"
                            required
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="nameFr" className="font-medium">Nom (Français) *</label>
                        <InputText
                            id="nameFr"
                            name="nameFr"
                            value={operationType.nameFr}
                            onChange={handleChange}
                            placeholder="Ex: Dépôt, Retrait"
                            className="w-full"
                            required
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="operationClass" className="font-medium">Classe d'Opération *</label>
                        <Dropdown
                            id="operationClass"
                            value={operationType.operationClass}
                            options={operationClasses}
                            onChange={(e) => handleDropdownChange('operationClass', e.value)}
                            placeholder="Sélectionner la classe"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="sortOrder" className="font-medium">Ordre d'affichage</label>
                        <InputNumber
                            id="sortOrder"
                            value={operationType.sortOrder}
                            onValueChange={(e) => handleNumberChange('sortOrder', e.value ?? 0)}
                            min={0}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="description" className="font-medium">Description</label>
                        <InputTextarea
                            id="description"
                            name="description"
                            value={operationType.description || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Description du type d'opération..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-building mr-2"></i>
                    Comptes Comptables
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="glDebitAccount" className="font-medium">Compte Débit (GL)</label>
                        <InputText
                            id="glDebitAccount"
                            name="glDebitAccount"
                            value={operationType.glDebitAccount || ''}
                            onChange={handleChange}
                            placeholder="Ex: 512000"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="glCreditAccount" className="font-medium">Compte Crédit (GL)</label>
                        <InputText
                            id="glCreditAccount"
                            name="glCreditAccount"
                            value={operationType.glCreditAccount || ''}
                            onChange={handleChange}
                            placeholder="Ex: 521000"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-sliders-h mr-2"></i>
                    Paramètres
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="requiresPassbookUpdate"
                                checked={operationType.requiresPassbookUpdate}
                                onChange={(e) => handleCheckboxChange('requiresPassbookUpdate', e.checked || false)}
                            />
                            <label htmlFor="requiresPassbookUpdate" className="ml-2">Mise à jour livret requise</label>
                        </div>
                    </div>
                    <div className="field col-12 md:col-4">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="requiresReceipt"
                                checked={operationType.requiresReceipt}
                                onChange={(e) => handleCheckboxChange('requiresReceipt', e.checked || false)}
                            />
                            <label htmlFor="requiresReceipt" className="ml-2">Reçu requis</label>
                        </div>
                    </div>
                    <div className="field col-12 md:col-4">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="requiresAuthorization"
                                checked={operationType.requiresAuthorization}
                                onChange={(e) => handleCheckboxChange('requiresAuthorization', e.checked || false)}
                            />
                            <label htmlFor="requiresAuthorization" className="ml-2">Autorisation requise</label>
                        </div>
                    </div>
                    <div className="field col-12 md:col-4">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="isSystemGenerated"
                                checked={operationType.isSystemGenerated}
                                onChange={(e) => handleCheckboxChange('isSystemGenerated', e.checked || false)}
                            />
                            <label htmlFor="isSystemGenerated" className="ml-2">Généré par le système</label>
                        </div>
                    </div>
                    <div className="field col-12 md:col-4">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="isActive"
                                checked={operationType.isActive}
                                onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                            />
                            <label htmlFor="isActive" className="ml-2">Actif</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationTypeForm;
