'use client';
import React, { useEffect, useState } from 'react';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { DecouvertRequest, STATUS_LABELS, STATUS_SEVERITY } from './DecouvertRequest';
import { getClientDisplayName } from '@/utils/clientUtils';

interface Props {
    decouvert: DecouvertRequest;
    onChange: (updated: DecouvertRequest) => void;
    savingsAccounts: any[];
    internalAccounts?: any[];
    viewOnly?: boolean;
}

const fmtNum = (v?: number | null) =>
    v != null ? new Intl.NumberFormat('fr-BI').format(v) : '–';

const fmtFbu = (v?: number | null) =>
    v != null ? new Intl.NumberFormat('fr-BI').format(v) + ' FBU' : '–';

export default function DecouvertRequestForm({
    decouvert,
    onChange,
    savingsAccounts,
    internalAccounts = [],
    viewOnly = false,
}: Props) {
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    useEffect(() => {
        if (decouvert.savingsAccountId && savingsAccounts.length > 0) {
            const found = savingsAccounts.find((a) => a.id === decouvert.savingsAccountId);
            setSelectedAccount(found ?? null);
        }
    }, [decouvert.savingsAccountId, savingsAccounts]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAccountChange = (account: any) => {
        setSelectedAccount(account);
        onChange({
            ...decouvert,
            savingsAccountId: account?.id,
            client: account?.client,
            solidarityGroup: account?.solidarityGroup,
        });
    };

    const handleAmountChange = (value: number | null) => {
        const requestedAmount = value ?? 0;
        const rate = decouvert.interestRate ?? 5;
        const interestAmount = parseFloat(((requestedAmount * rate) / 100).toFixed(2));
        onChange({ ...decouvert, requestedAmount, interestAmount, totalAmount: parseFloat((requestedAmount + interestAmount).toFixed(2)) });
    };

    const handleRateChange = (value: number | null) => {
        const interestRate = value ?? 5;
        const requestedAmount = decouvert.requestedAmount ?? 0;
        const interestAmount = parseFloat(((requestedAmount * interestRate) / 100).toFixed(2));
        onChange({ ...decouvert, interestRate, interestAmount, totalAmount: parseFloat((requestedAmount + interestAmount).toFixed(2)) });
    };

    // ── Internal-account dropdown templates (same as virements) ──────────────

    const internalItemTemplate = (item: any) => (
        <span>
            <strong>{item.codeCompte}</strong> – {item.libelle}
            <span className="text-500 ml-2">
                (Solde: {new Intl.NumberFormat('fr-BI').format(item.soldeActuel ?? 0)} FBU)
            </span>
        </span>
    );

    const internalValueTemplate = (item: any, props: any) => {
        if (item) return <span><strong>{item.codeCompte}</strong> – {item.libelle}</span>;
        return <span className="text-400">{props?.placeholder}</span>;
    };

    const internalDropdown = (
        label: string,
        field: keyof DecouvertRequest,
        placeholder: string,
        helpText?: string,
    ) => {
        const currentCode = decouvert[field] as string | undefined;
        const currentItem = internalAccounts.find((a) => a.codeCompte === currentCode) ?? null;

        return (
            <div className="field col-12 md:col-4">
                <label className="font-medium block mb-1">{label}</label>
                {viewOnly ? (
                    <InputText
                        value={currentItem ? `${currentItem.codeCompte} – ${currentItem.libelle}` : (currentCode ?? '–')}
                        readOnly
                        className="w-full"
                    />
                ) : (
                    <Dropdown
                        value={currentItem}
                        options={internalAccounts}
                        onChange={(e) => onChange({ ...decouvert, [field]: e.value?.codeCompte ?? null })}
                        optionLabel="codeCompte"
                        placeholder={placeholder}
                        filter
                        filterBy="codeCompte,libelle"
                        showClear
                        className="w-full"
                        itemTemplate={internalItemTemplate}
                        valueTemplate={internalValueTemplate}
                        emptyMessage="Aucun compte interne"
                    />
                )}
                {helpText && <small className="text-500">{helpText}</small>}
            </div>
        );
    };

    // ── Read-only helper ──────────────────────────────────────────────────────

    const roField = (label: string, value: string | number | undefined | null) => (
        <div className="col-12 md:col-6">
            <label className="font-semibold block mb-1">{label}</label>
            <InputText value={value != null ? String(value) : '–'} readOnly className="w-full" />
        </div>
    );

    const accountLabel = (a: any) => {
        if (!a) return '';
        const name = a.client ? getClientDisplayName(a.client) : a.solidarityGroup?.groupName ?? '';
        return `${a.accountNumber} – ${name}`;
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-fluid">

            {/* ── 1. Compte d'épargne ─────────────────────────────────────── */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-wallet mr-2" />
                    Compte d'Épargne Client
                </h5>
                <div className="formgrid grid">

                    <div className="field col-12 md:col-6">
                        <label className="font-medium">Compte d'Épargne *</label>
                        {viewOnly ? (
                            <InputText
                                value={selectedAccount ? accountLabel(selectedAccount) : (decouvert.savingsAccountId ? String(decouvert.savingsAccountId) : '–')}
                                readOnly className="w-full"
                            />
                        ) : (
                            <Dropdown
                                value={selectedAccount}
                                options={savingsAccounts}
                                onChange={(e) => handleAccountChange(e.value)}
                                optionLabel={(a) => accountLabel(a)}
                                filter
                                filterBy="accountNumber"
                                placeholder="Sélectionner un compte"
                                className="w-full"
                                emptyMessage="Aucun compte actif"
                                itemTemplate={(a: any) => (
                                    <span>
                                        {a.accountNumber} – {a.client ? getClientDisplayName(a.client) : a.solidarityGroup?.groupName ?? ''}
                                        <span className="text-500 ml-2">
                                            (Solde: {fmtNum(a.currentBalance ?? 0)} FBU)
                                        </span>
                                    </span>
                                )}
                            />
                        )}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium">Titulaire</label>
                        <InputText
                            value={
                                selectedAccount?.client
                                    ? getClientDisplayName(selectedAccount.client)
                                    : selectedAccount?.solidarityGroup?.groupName ?? '–'
                            }
                            readOnly className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium">Solde Actuel</label>
                        <InputText
                            value={
                                selectedAccount?.currentBalance != null
                                    ? fmtFbu(selectedAccount.currentBalance)
                                    : decouvert.balanceAtRequest != null
                                        ? fmtFbu(decouvert.balanceAtRequest)
                                        : '–'
                            }
                            readOnly
                            className="w-full"
                            style={{
                                color: (selectedAccount?.currentBalance ?? decouvert.balanceAtRequest ?? 0) < 0
                                    ? '#e74c3c' : '#27ae60',
                                fontWeight: 'bold',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── 2. Montants ─────────────────────────────────────────────── */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-money-bill mr-2" />
                    Montant et Intérêts
                </h5>
                <div className="formgrid grid">

                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Montant Demandé (FBU) *</label>
                        {viewOnly ? (
                            <InputText value={fmtFbu(decouvert.requestedAmount)} readOnly className="w-full" />
                        ) : (
                            <InputNumber
                                value={decouvert.requestedAmount ?? null}
                                onValueChange={(e) => handleAmountChange(e.value ?? null)}
                                mode="decimal"
                                locale="fr-BI"
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                min={0}
                                placeholder="Ex: 50 000"
                                className="w-full"
                            />
                        )}
                    </div>

                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Taux d'Intérêt (%)</label>
                        {viewOnly ? (
                            <InputText value={`${decouvert.interestRate ?? 5} %`} readOnly className="w-full" />
                        ) : (
                            <InputNumber
                                value={decouvert.interestRate ?? 5}
                                onValueChange={(e) => handleRateChange(e.value ?? null)}
                                suffix=" %"
                                minFractionDigits={2}
                                maxFractionDigits={2}
                                min={0}
                                max={100}
                                className="w-full"
                            />
                        )}
                    </div>

                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Montant des Intérêts</label>
                        <InputText
                            value={fmtFbu(decouvert.interestAmount)}
                            readOnly
                            className="w-full font-semibold"
                            style={{ color: '#e74c3c' }}
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label className="font-medium">Total à Débiter</label>
                        <InputText
                            value={fmtFbu(decouvert.totalAmount)}
                            readOnly
                            className="w-full font-bold"
                            style={{ color: '#2980b9' }}
                        />
                    </div>
                </div>

                {/* Insufficient balance warning (create mode only) */}
                {!viewOnly && selectedAccount && (decouvert.requestedAmount ?? 0) > 0 && (
                    <div
                        className="p-2 border-round mt-1"
                        style={{
                            background: '#fff3cd',
                            border: '1px solid #ffc107',
                        }}
                    >
                        <i className="pi pi-exclamation-triangle mr-2" style={{ color: '#e67e22' }} />
                        <strong>Découvert :</strong> Le compte peut devenir{' '}
                        <strong style={{ color: '#e74c3c' }}>
                            {fmtFbu((selectedAccount?.currentBalance ?? 0) - (decouvert.totalAmount ?? 0))}
                        </strong>{' '}
                        après décaissement. Les intérêts ({decouvert.interestRate ?? 5}%) sont prélevés immédiatement.
                    </div>
                )}
            </div>

            {/* ── 3. Comptes internes (portefeuille / intérêt / pénalité) ──── */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-building mr-2" />
                    Comptes Internes de Contrepartie
                </h5>
                <div className="formgrid grid">
                    {internalDropdown(
                        'Portefeuille Découvert *',
                        'portefeuilleDecouvertAccountCode',
                        'Compte portefeuille...',
                        'Crédit lors du décaissement (ex: 25300)',
                    )}
                    {internalDropdown(
                        'Produits Intérêts Découvert *',
                        'interetAccountCode',
                        'Compte intérêts...',
                        'Crédit des intérêts (ex: 70613)',
                    )}
                    {internalDropdown(
                        'Compte Pénalités',
                        'penaliteAccountCode',
                        'Compte pénalités...',
                        'Optionnel – pénalités éventuelles (ex: 70800)',
                    )}
                </div>

                {/* Show current balance of selected internal accounts */}
                {!viewOnly && internalAccounts.length > 0 && (
                    <div className="grid mt-2">
                        {(['portefeuilleDecouvertAccountCode', 'interetAccountCode', 'penaliteAccountCode'] as const).map((key) => {
                            const code = decouvert[key] as string | undefined;
                            const acc  = internalAccounts.find((a) => a.codeCompte === code);
                            if (!acc) return null;
                            return (
                                <div key={key} className="col-12 md:col-4">
                                    <div className="p-2 surface-50 border-round flex align-items-center gap-2">
                                        <i className="pi pi-chart-bar text-blue-500" />
                                        <span className="text-600 text-sm">
                                            <strong>{acc.codeCompte}</strong> – Solde:{' '}
                                            <strong className="text-primary">
                                                {fmtFbu(acc.soldeActuel ?? 0)}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── 4. Motif & Notes ────────────────────────────────────────── */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-comment mr-2" />
                    Motif et Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-medium">Motif *</label>
                        {viewOnly ? (
                            <InputText value={decouvert.motif ?? '–'} readOnly className="w-full" />
                        ) : (
                            <InputText
                                value={decouvert.motif ?? ''}
                                onChange={(e) => onChange({ ...decouvert, motif: e.target.value })}
                                placeholder="Raison de la demande de découvert"
                                className="w-full"
                            />
                        )}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-medium">Notes</label>
                        {viewOnly ? (
                            <InputTextarea value={decouvert.notes ?? '–'} readOnly className="w-full" rows={2} />
                        ) : (
                            <InputTextarea
                                value={decouvert.notes ?? ''}
                                onChange={(e) => onChange({ ...decouvert, notes: e.target.value })}
                                rows={2}
                                className="w-full"
                                placeholder="Observations complémentaires..."
                                autoResize
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ── 5. View-only audit fields ───────────────────────────────── */}
            {viewOnly && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-history mr-2" />
                        Traçabilité
                    </h5>
                    <div className="formgrid grid">
                        {roField('Numéro de Demande', decouvert.requestNumber)}
                        {roField('Date de Demande', decouvert.requestDate)}

                        <div className="col-12 md:col-6">
                            <label className="font-semibold block mb-1">Statut</label>
                            <Tag
                                value={STATUS_LABELS[decouvert.status ?? 'PENDING']}
                                severity={STATUS_SEVERITY[decouvert.status ?? 'PENDING']}
                            />
                        </div>

                        {decouvert.verifiedBy    && roField('Vérifié par',    decouvert.verifiedBy)}
                        {decouvert.verifiedAt    && roField('Vérifié le',     decouvert.verifiedAt?.toString().substring(0, 16))}
                        {decouvert.verificationComments && roField('Commentaires vérif.', decouvert.verificationComments)}

                        {decouvert.approvedBy    && roField('Approuvé par',   decouvert.approvedBy)}
                        {decouvert.approvedAt    && roField('Approuvé le',    decouvert.approvedAt?.toString().substring(0, 16))}
                        {decouvert.approvalComments && roField('Commentaires approbation', decouvert.approvalComments)}

                        {decouvert.disbursedBy   && roField('Décaissé par',   decouvert.disbursedBy)}
                        {decouvert.disbursedAt   && roField('Décaissé le',    decouvert.disbursedAt?.toString().substring(0, 16))}

                        {decouvert.balanceAfterDisbursement != null && (
                            <div className="col-12 md:col-6">
                                <label className="font-semibold block mb-1">Solde après décaissement</label>
                                <InputText
                                    value={fmtFbu(decouvert.balanceAfterDisbursement)}
                                    readOnly
                                    className="w-full font-bold"
                                    style={{ color: decouvert.balanceAfterDisbursement < 0 ? '#e74c3c' : '#27ae60' }}
                                />
                            </div>
                        )}

                        {decouvert.rejectionReason && roField('Motif rejet/annulation', decouvert.rejectionReason)}
                        {decouvert.pieceId         && roField('Référence comptable',     decouvert.pieceId)}

                        {/* Internal accounts used */}
                        {decouvert.portefeuilleDecouvertAccountCode && roField('Portefeuille Découvert', decouvert.portefeuilleDecouvertAccountCode)}
                        {decouvert.interetAccountCode               && roField('Compte Intérêts',         decouvert.interetAccountCode)}
                        {decouvert.penaliteAccountCode              && roField('Compte Pénalités',         decouvert.penaliteAccountCode)}
                    </div>
                </div>
            )}
        </div>
    );
}
