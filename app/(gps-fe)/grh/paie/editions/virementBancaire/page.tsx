'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
import { useReactToPrint } from 'react-to-print';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import {
    VirementBancaireResponseDto,
    VirementBancaireBanqueGroupDto,
    VirementBancaireEmployeeDto,
    RHBanque,
    formatCurrency,
    getFullName
} from './VirementBancaire';
import { API_BASE_URL } from '@/utils/apiConfig';
import PrintableVirementBancaire from './PrintableVirementBancaire';

const VirementBancaireComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);
    const [selectedBankGroupForPrint, setSelectedBankGroupForPrint] = useState<VirementBancaireBanqueGroupDto | null>(null);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [banks, setBanks] = useState<RHBanque[]>([]);
    const [selectedCompanyBank, setSelectedCompanyBank] = useState<RHBanque | null>(null);
    const [companyBankCompte, setCompanyBankCompte] = useState<string>('');
    const [virementData, setVirementData] = useState<VirementBancaireResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);
    const [loadingBanks, setLoadingBanks] = useState<boolean>(false);
    const [downloadingAll, setDownloadingAll] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');
    const { data: banksData, fetchData: fetchBanks, callType: banksCallType } = useConsumApi('');
    const { data: virementDataResponse, error: virementError, fetchData: fetchVirement, callType } = useConsumApi('');

    // Load banks on mount
    useEffect(() => {
        setLoadingBanks(true);
        fetchBanks(null, 'Get', `${baseUrl}/api/grh/paie/virement-bancaire/banks`, 'loadBanks');
    }, []);

    // Handle banks response
    useEffect(() => {
        if (banksData && banksCallType === 'loadBanks') {
            const data = Array.isArray(banksData) ? banksData : [banksData];
            setBanks(data);
            setLoadingBanks(false);
        }
    }, [banksData, banksCallType]);

    // Load periodes by year
    useEffect(() => {
        setLoadingPeriodes(true);
        setSelectedPeriode(null);
        fetchPeriodes(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${selectedYear}`, 'loadPeriodes');
    }, [selectedYear]);

    // Handle periodes response
    useEffect(() => {
        if (periodesData) {
            const data = Array.isArray(periodesData) ? periodesData : [periodesData];
            setPeriodes(data);
            setLoadingPeriodes(false);
        }
    }, [periodesData]);

    // Handle virement data response
    useEffect(() => {
        if (virementDataResponse && callType === 'loadVirement') {
            setVirementData(virementDataResponse as VirementBancaireResponseDto);
            setLoading(false);
            showToast('success', 'Succes', 'Donnees chargees avec succes.');
        }

        if (virementError && callType === 'loadVirement') {
            showToast('error', 'Erreur', 'Impossible de charger les donnees.');
            setVirementData(null);
            setLoading(false);
        }
    }, [virementDataResponse, virementError, callType]);

    // When company bank is selected, auto-fill the account
    useEffect(() => {
        if (selectedCompanyBank) {
            setCompanyBankCompte(selectedCompanyBank.compte || '');
        }
    }, [selectedCompanyBank]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleLoadVirement = () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }
        if (!selectedCompanyBank) {
            showToast('warn', 'Validation', 'Veuillez selectionner une banque de virement.');
            return;
        }
        if (!companyBankCompte) {
            showToast('warn', 'Validation', 'Veuillez saisir le compte de la societe.');
            return;
        }

        setLoading(true);
        const url = `${baseUrl}/api/grh/paie/virement-bancaire/${selectedPeriode.periodeId}?companyBankCode=${encodeURIComponent(selectedCompanyBank.codeBanque)}&companyBankCompte=${encodeURIComponent(companyBankCompte)}`;
        fetchVirement(null, 'Get', url, 'loadVirement');
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `Virement_${selectedBankGroupForPrint?.sigleBanque || 'bancaire'}_${selectedPeriode?.periodeId || 'report'}`,
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 10mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `,
        onAfterPrint: () => {
            showToast('success', 'Succes', 'Impression terminee.');
            setPrintDialogVisible(false);
        }
    });

    const openPrintDialog = (bankGroup: VirementBancaireBanqueGroupDto) => {
        setSelectedBankGroupForPrint(bankGroup);
        setPrintDialogVisible(true);
    };

    const handleDownloadAll = async () => {
        if (!virementData || !selectedPeriode || !selectedCompanyBank) return;

        setDownloadingAll(true);
        try {
            const url = `${baseUrl}/api/grh/paie/virement-bancaire/${selectedPeriode.periodeId}/pdf/all?companyBankCode=${encodeURIComponent(selectedCompanyBank.codeBanque)}&companyBankCompte=${encodeURIComponent(companyBankCompte)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || ''}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `VirementsBancaires_${selectedPeriode.periodeId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            showToast('success', 'Succes', 'Telechargement termine.');
        } catch (error) {
            showToast('error', 'Erreur', 'Impossible de telecharger les fichiers.');
        } finally {
            setDownloadingAll(false);
        }
    };

    const getMonthName = (mois: number): string => {
        const months = [
            'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
        ];
        return mois >= 1 && mois <= 12 ? months[mois - 1] : String(mois);
    };

    const periodeOptionTemplate = (option: PeriodePaie) => (
        <span>{getMonthName(option.mois)} / {option.annee}</span>
    );

    const selectedPeriodeTemplate = (option: PeriodePaie | null) => {
        if (option) {
            return <span>{getMonthName(option.mois)} / {option.annee}</span>;
        }
        return <span>Selectionner une periode</span>;
    };

    const bankOptionTemplate = (option: RHBanque) => (
        <span>{option.libelleBanque}</span>
    );

    const selectedBankTemplate = (option: RHBanque | null) => {
        if (option) {
            return <span>{option.libelleBanque}</span>;
        }
        return <span>Selectionner une banque</span>;
    };

    const renderBankGroup = (bankGroup: VirementBancaireBanqueGroupDto) => {
        return (
            <Panel
                key={bankGroup.codeBanque}
                header={
                    <div className="flex justify-content-between align-items-center w-full">
                        <span className="font-bold text-red-700">{bankGroup.sigleBanque}</span>
                        <Button
                            icon="pi pi-print"
                            label="Imprimer"
                            size="small"
                            severity="info"
                            onClick={() => openPrintDialog(bankGroup)}
                        />
                    </div>
                }
                className="mb-3"
                toggleable
            >
                <DataTable
                    value={bankGroup.employees}
                    size="small"
                    stripedRows
                    emptyMessage="Aucun employe"
                >
                    <Column field="matriculeId" header="MatriculeId" style={{ width: '100px' }} />
                    <Column
                        header="Nom et Prenom"
                        body={(row: VirementBancaireEmployeeDto) => (
                            <span className="text-red-700">{getFullName(row)}</span>
                        )}
                    />
                    <Column field="compte" header="Compte" />
                    <Column
                        header="Net"
                        body={(row: VirementBancaireEmployeeDto) => formatCurrency(row.net)}
                        style={{ textAlign: 'right', width: '120px' }}
                    />
                </DataTable>
                <div className="flex justify-content-between mt-3 pt-2 border-top-1 border-300">
                    <span className="font-bold">{bankGroup.employeeCount} Employes</span>
                    <span className="font-bold">{formatCurrency(bankGroup.totalNet)}</span>
                </div>
            </Panel>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Virement Bancaire - Liste d'ordre de virement</h5>

                {/* Filter Section */}
                <div className="formgrid grid mb-4">
                    <div className="field col-12 md:col-2">
                        <label htmlFor="selectedYear">Exercice</label>
                        <InputNumber
                            id="selectedYear"
                            value={selectedYear}
                            onValueChange={(e) => setSelectedYear(e.value || new Date().getFullYear())}
                            useGrouping={false}
                            min={2020}
                            max={2100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label htmlFor="periode">Periode</label>
                        <Dropdown
                            id="periode"
                            value={selectedPeriode}
                            options={periodes}
                            onChange={(e) => setSelectedPeriode(e.value)}
                            optionLabel="periodeId"
                            itemTemplate={periodeOptionTemplate}
                            valueTemplate={selectedPeriodeTemplate}
                            placeholder="Selectionner"
                            className="w-full"
                            loading={loadingPeriodes}
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="companyBank">Banque de Virement</label>
                        <Dropdown
                            id="companyBank"
                            value={selectedCompanyBank}
                            options={banks}
                            onChange={(e) => setSelectedCompanyBank(e.value)}
                            optionLabel="libelleBanque"
                            itemTemplate={bankOptionTemplate}
                            valueTemplate={selectedBankTemplate}
                            placeholder="Selectionner"
                            className="w-full"
                            loading={loadingBanks}
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label htmlFor="companyCompte">Compte Societe</label>
                        <InputText
                            id="companyCompte"
                            value={companyBankCompte}
                            onChange={(e) => setCompanyBankCompte(e.target.value)}
                            className="w-full"
                            placeholder="Numero de compte"
                        />
                    </div>
                    <div className="field col-12 md:col-3 flex align-items-end gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Charger"
                            onClick={handleLoadVirement}
                            loading={loading}
                        />
                        {virementData && virementData.banqueGroups.length > 0 && (
                            <Button
                                icon="pi pi-download"
                                label="Tout telecharger"
                                severity="success"
                                onClick={handleDownloadAll}
                                loading={downloadingAll}
                            />
                        )}
                    </div>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-content-center align-items-center p-5">
                        <ProgressSpinner />
                    </div>
                )}

                {/* Report Display */}
                {!loading && virementData && (
                    <div>
                        {/* Header Info */}
                        <div className="surface-100 p-3 border-round mb-4">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="text-lg font-bold text-primary mb-2">
                                        {virementData.periodeLibelle}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Banque de Virement: </span>
                                        <span className="text-red-700 font-bold">{virementData.companyBankLibelle}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Compte: </span>
                                        <span className="text-red-700 font-bold">{virementData.companyBankCompte}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6 text-right">
                                    <div className="text-lg font-bold">
                                        Total: {virementData.grandTotalEmployeeCount} employes
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {formatCurrency(virementData.grandTotalNet)} BIF
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Groups */}
                        {virementData.banqueGroups.map(renderBankGroup)}
                    </div>
                )}

                {/* No Data Message */}
                {!loading && virementData && virementData.banqueGroups.length === 0 && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour cette periode.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header={`Apercu d'impression - ${selectedBankGroupForPrint?.sigleBanque || ''}`}
                visible={printDialogVisible}
                style={{ width: '70vw', maxWidth: '900px' }}
                modal
                maximizable
                onHide={() => setPrintDialogVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            onClick={() => setPrintDialogVisible(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={() => handlePrint()}
                        />
                    </div>
                }
            >
                <div style={{ overflowX: 'auto' }}>
                    {selectedBankGroupForPrint && virementData && (
                        <PrintableVirementBancaire
                            ref={printableRef}
                            bankGroup={selectedBankGroupForPrint}
                            companyBankLibelle={virementData.companyBankLibelle}
                            companyBankCompte={virementData.companyBankCompte}
                            periodeLibelle={virementData.periodeLibelle}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default VirementBancaireComponent;
