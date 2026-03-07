'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InternalAccount } from '../types';

interface InternalAccountFormProps {
    account: InternalAccount;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null | undefined) => void;
    comptes: any[];
    isViewMode?: boolean;
    isEditMode?: boolean;
}

const InternalAccountForm: React.FC<InternalAccountFormProps> = ({
    account,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    comptes,
    isViewMode = false,
    isEditMode = false
}) => {
    // Filter comptes to only show detail accounts (typeCompte = 0) that are active
    const detailComptes = comptes.filter((c: any) => c.typeCompte === 0 && c.actif !== false);

    return (
        <div className="card p-fluid">
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-building mr-2"></i>
                    Compte Comptable
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="compteComptableId" className="font-medium">Compte du Plan Comptable *</label>
                        <Dropdown
                            id="compteComptableId"
                            value={account.compteComptableId}
                            options={detailComptes}
                            onChange={(e) => {
                                handleDropdownChange('compteComptableId', e.value);
                                const selected = detailComptes.find((c: any) => c.compteId === e.value);
                                if (selected) {
                                    handleDropdownChange('codeCompte', selected.codeCompte);
                                    handleDropdownChange('libelle', selected.libelle);
                                }
                            }}
                            optionLabel="codeCompte"
                            optionValue="compteId"
                            placeholder="Sélectionner un compte..."
                            disabled={isViewMode || isEditMode}
                            filter
                            filterBy="codeCompte,libelle"
                            filterPlaceholder="Rechercher par code ou libellé"
                            className="w-full"
                            itemTemplate={(item: any) => (
                                <span>{item.codeCompte} - {item.libelle}</span>
                            )}
                            valueTemplate={(item: any, props: any) => {
                                if (item) {
                                    return <span>{item.codeCompte} - {item.libelle}</span>;
                                }
                                return <span>{props?.placeholder}</span>;
                            }}
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    {account.accountNumber && (
                        <div className="field col-12 md:col-3">
                            <label htmlFor="accountNumber" className="font-medium">N° Compte</label>
                            <InputText
                                id="accountNumber"
                                value={account.accountNumber}
                                disabled
                                className="w-full font-bold"
                            />
                            <small className="text-500">Généré automatiquement</small>
                        </div>
                    )}
                    <div className={`field col-12 ${account.accountNumber ? 'md:col-3' : 'md:col-4'}`}>
                        <label htmlFor="codeCompte" className="font-medium">Code Comptable</label>
                        <InputText
                            id="codeCompte"
                            value={account.codeCompte}
                            disabled
                            className="w-full"
                        />
                    </div>
                    <div className={`field col-12 ${account.accountNumber ? 'md:col-6' : 'md:col-8'}`}>
                        <label htmlFor="libelle" className="font-medium">Libellé</label>
                        <InputText
                            id="libelle"
                            name="libelle"
                            value={account.libelle}
                            onChange={handleChange}
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-dollar mr-2"></i>
                    Paramètres
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="soldeActuel" className="font-medium">Solde Actuel</label>
                        <InputNumber
                            id="soldeActuel"
                            value={account.soldeActuel}
                            onValueChange={(e) => handleNumberChange('soldeActuel', e.value)}
                            mode="decimal"
                            suffix=" FBU"
                            disabled
                            className="w-full"
                        />
                        <small className="text-500">Le solde est mis à jour automatiquement par les opérations</small>
                    </div>
                    <div className="field col-12 md:col-6 flex align-items-center">
                        <div>
                            <label htmlFor="actif" className="font-medium block mb-2">Actif</label>
                            <InputSwitch
                                id="actif"
                                checked={account.actif}
                                onChange={(e) => handleDropdownChange('actif', e.value)}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-file mr-2"></i>
                    Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <InputTextarea
                            id="notes"
                            name="notes"
                            value={account.notes || ''}
                            onChange={handleChange}
                            rows={3}
                            disabled={isViewMode}
                            placeholder="Notes additionnelles..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternalAccountForm;
