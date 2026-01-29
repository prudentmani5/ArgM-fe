import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { LoanRestructuring } from './LoanRestructuring';

interface LoanRestructuringFormProps {
    entity: LoanRestructuring;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: string, value: any) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleCheckboxChange?: (name: string, checked: boolean) => void;
}

const LoanRestructuringForm: React.FC<LoanRestructuringFormProps> = ({
    entity,
    handleChange,
    handleNumberChange,
    handleDropdownChange
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const statusOptions = [
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Approuvé', value: 'APPROVED' },
        { label: 'Rejeté', value: 'REJECTED' },
        { label: 'Implémenté', value: 'IMPLEMENTED' }
    ];

    return (
        <div className="formgrid grid">
            {/* Informations Générales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Informations Générales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="loanId">ID Prêt *</label>
                            <InputNumber
                                id="loanId"
                                value={entity.loanId}
                                onValueChange={(e) => handleNumberChange('loanId', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="restructuringDate">Date de Restructuration *</label>
                            <Calendar
                                id="restructuringDate"
                                value={formatDate(entity.restructuringDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('restructuringDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="status">Statut *</label>
                            <Dropdown
                                id="status"
                                value={entity.status}
                                onChange={(e) => handleDropdownChange('status', e.value)}
                                options={statusOptions}
                                placeholder="Sélectionner un statut"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="restructuringReason">Raison de la Restructuration *</label>
                            <InputTextarea
                                id="restructuringReason"
                                name="restructuringReason"
                                value={entity.restructuringReason}
                                onChange={handleChange}
                                rows={3}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditions Originales */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#fce4ec' }}>
                    <h5 className="mt-0" style={{ color: '#880e4f' }}>Conditions Originales</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="originalPrincipal">Principal Original</label>
                            <InputNumber
                                id="originalPrincipal"
                                value={entity.originalPrincipal}
                                onValueChange={(e) => handleNumberChange('originalPrincipal', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="originalInterestRate">Taux d'Intérêt Original (%)</label>
                            <InputNumber
                                id="originalInterestRate"
                                value={entity.originalInterestRate}
                                onValueChange={(e) => handleNumberChange('originalInterestRate', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                suffix="%"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="originalTermMonths">Durée Originale (Mois)</label>
                            <InputNumber
                                id="originalTermMonths"
                                value={entity.originalTermMonths}
                                onValueChange={(e) => handleNumberChange('originalTermMonths', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="originalMaturityDate">Date d'Échéance Originale</label>
                            <Calendar
                                id="originalMaturityDate"
                                value={formatDate(entity.originalMaturityDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('originalMaturityDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nouvelles Conditions */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round" style={{ backgroundColor: '#e8f5e9' }}>
                    <h5 className="mt-0" style={{ color: '#1b5e20' }}>Nouvelles Conditions</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <label htmlFor="newPrincipal">Nouveau Principal</label>
                            <InputNumber
                                id="newPrincipal"
                                value={entity.newPrincipal}
                                onValueChange={(e) => handleNumberChange('newPrincipal', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="newInterestRate">Nouveau Taux d'Intérêt (%)</label>
                            <InputNumber
                                id="newInterestRate"
                                value={entity.newInterestRate}
                                onValueChange={(e) => handleNumberChange('newInterestRate', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                suffix="%"
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="newTermMonths">Nouvelle Durée (Mois)</label>
                            <InputNumber
                                id="newTermMonths"
                                value={entity.newTermMonths}
                                onValueChange={(e) => handleNumberChange('newTermMonths', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-3">
                            <label htmlFor="newMaturityDate">Nouvelle Date d'Échéance</label>
                            <Calendar
                                id="newMaturityDate"
                                value={formatDate(entity.newMaturityDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('newMaturityDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Impayés à la Restructuration */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Impayés à la Restructuration</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="principalOutstanding">Principal Impayé</label>
                            <InputNumber
                                id="principalOutstanding"
                                value={entity.principalOutstanding}
                                onValueChange={(e) => handleNumberChange('principalOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="interestOutstanding">Intérêts Impayés</label>
                            <InputNumber
                                id="interestOutstanding"
                                value={entity.interestOutstanding}
                                onValueChange={(e) => handleNumberChange('interestOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="penaltiesOutstanding">Pénalités Impayées</label>
                            <InputNumber
                                id="penaltiesOutstanding"
                                value={entity.penaltiesOutstanding}
                                onValueChange={(e) => handleNumberChange('penaltiesOutstanding', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Traitement des Arriérés */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Traitement des Arriérés</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="arrearsCapitalized">Arriérés Capitalisés</label>
                            <InputNumber
                                id="arrearsCapitalized"
                                value={entity.arrearsCapitalized}
                                onValueChange={(e) => handleNumberChange('arrearsCapitalized', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="arrearsWaived">Arriérés Exonérés</label>
                            <InputNumber
                                id="arrearsWaived"
                                value={entity.arrearsWaived}
                                onValueChange={(e) => handleNumberChange('arrearsWaived', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="arrearsRescheduled">Arriérés Rééchelonnés</label>
                            <InputNumber
                                id="arrearsRescheduled"
                                value={entity.arrearsRescheduled}
                                onValueChange={(e) => handleNumberChange('arrearsRescheduled', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Période de Grâce et Frais */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Période de Grâce et Frais</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="gracePeriodMonths">Période de Grâce (Mois)</label>
                            <InputNumber
                                id="gracePeriodMonths"
                                value={entity.gracePeriodMonths}
                                onValueChange={(e) => handleNumberChange('gracePeriodMonths', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="restructuringFee">Frais de Restructuration</label>
                            <InputNumber
                                id="restructuringFee"
                                value={entity.restructuringFee}
                                onValueChange={(e) => handleNumberChange('restructuringFee', e.value)}
                                mode="decimal"
                                minFractionDigits={2}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Approbation */}
            <div className="field col-12">
                <div className="surface-100 p-3 border-round">
                    <h5 className="mt-0">Approbation</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label htmlFor="requestedById">ID Demandé Par *</label>
                            <InputNumber
                                id="requestedById"
                                value={entity.requestedById}
                                onValueChange={(e) => handleNumberChange('requestedById', e.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="approvedById">ID Approuvé Par</label>
                            <InputNumber
                                id="approvedById"
                                value={entity.approvedById}
                                onValueChange={(e) => handleNumberChange('approvedById', e.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label htmlFor="approvalDate">Date d'Approbation</label>
                            <Calendar
                                id="approvalDate"
                                value={formatDate(entity.approvalDate)}
                                onChange={(e) => {
                                    if (e.value) {
                                        const date = e.value as Date;
                                        handleDropdownChange('approvalDate', date.toISOString().split('T')[0]);
                                    }
                                }}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                                showIcon
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="notes">Notes</label>
                            <InputTextarea
                                id="notes"
                                name="notes"
                                value={entity.notes || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanRestructuringForm;
