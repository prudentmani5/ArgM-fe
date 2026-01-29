'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { ColorPicker } from 'primereact/colorpicker';
import { StatutDemande } from '../../types/CreditTypes';

interface StatutDemandeFormProps {
    statut: StatutDemande;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleColorChange: (name: string, value: string) => void;
    isViewMode?: boolean;
}

export default function StatutDemandeForm({
    statut,
    handleChange,
    handleCheckboxChange,
    handleNumberChange,
    handleColorChange,
    isViewMode = false
}: StatutDemandeFormProps) {
    return (
        <div className="surface-100 p-3 border-round mb-4">
            <h5 className="mb-3">
                <i className="pi pi-tag mr-2"></i>
                Informations du Statut de Demande
            </h5>

            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="code" className="font-semibold">Code *</label>
                    <InputText
                        id="code"
                        name="code"
                        value={statut.code || ''}
                        onChange={handleChange}
                        className="w-full"
                        disabled={isViewMode}
                        placeholder="Ex: PENDING_DOCS"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                    <InputText
                        id="name"
                        name="name"
                        value={statut.name || ''}
                        onChange={handleChange}
                        className="w-full"
                        disabled={isViewMode}
                        placeholder="Ex: Pending Documents"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                    <InputText
                        id="nameFr"
                        name="nameFr"
                        value={statut.nameFr || ''}
                        onChange={handleChange}
                        className="w-full"
                        disabled={isViewMode}
                        placeholder="Ex: En attente de documents"
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="description" className="font-semibold">Description</label>
                    <InputTextarea
                        id="description"
                        name="description"
                        value={statut.description || ''}
                        onChange={handleChange}
                        className="w-full"
                        rows={3}
                        disabled={isViewMode}
                        placeholder="Description du statut..."
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="sequenceOrder" className="font-semibold">Ordre de séquence</label>
                    <InputNumber
                        id="sequenceOrder"
                        value={statut.sequenceOrder || 0}
                        onValueChange={(e) => handleNumberChange('sequenceOrder', e.value ?? 0)}
                        className="w-full"
                        disabled={isViewMode}
                        min={0}
                        showButtons
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="color" className="font-semibold">Couleur</label>
                    <div className="flex align-items-center gap-2">
                        <ColorPicker
                            value={statut.color?.replace('#', '') || '000000'}
                            onChange={(e) => handleColorChange('color', '#' + e.value)}
                            disabled={isViewMode}
                        />
                        <InputText
                            value={statut.color || '#000000'}
                            onChange={handleChange}
                            name="color"
                            className="w-full"
                            disabled={isViewMode}
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-4">
                    <div className="flex align-items-center gap-2 mt-4">
                        <Checkbox
                            inputId="allowsEdit"
                            checked={statut.allowsEdit || false}
                            onChange={(e) => handleCheckboxChange('allowsEdit', e.checked ?? false)}
                            disabled={isViewMode}
                        />
                        <label htmlFor="allowsEdit" className="font-semibold">
                            Permet la modification
                        </label>
                    </div>
                </div>

                <div className="field col-12 md:col-4">
                    <div className="flex align-items-center gap-2 mt-4">
                        <Checkbox
                            inputId="isActive"
                            checked={statut.isActive || false}
                            onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)}
                            disabled={isViewMode}
                        />
                        <label htmlFor="isActive" className="font-semibold">
                            Actif
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
