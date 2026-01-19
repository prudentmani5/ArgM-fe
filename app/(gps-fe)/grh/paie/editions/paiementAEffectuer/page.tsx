'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useReactToPrint } from 'react-to-print';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import { PaiementsAEffectuerResponseDto, PaiementsAEffectuerBanqueDto, PaiementsAEffectuerRetenueDto } from './PaiementsAEffectuer';
import { API_BASE_URL } from '@/utils/apiConfig';
import PrintablePaiementsAEffectuer from './PrintablePaiementsAEffectuer';

const PaiementsAEffectuerComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [reportData, setReportData] = useState<PaiementsAEffectuerResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');
    const { data: reportDataResponse, error: reportError, fetchData: fetchReport, callType } = useConsumApi('');

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

    // Handle report data response
    useEffect(() => {
        if (reportDataResponse && callType === 'loadReport') {
            setReportData(reportDataResponse as PaiementsAEffectuerResponseDto);
            setLoading(false);
            showToast('success', 'Succes', 'Rapport charge avec succes.');
        }

        if (reportError && callType === 'loadReport') {
            showToast('error', 'Erreur', 'Impossible de charger le rapport.');
            setReportData(null);
            setLoading(false);
        }
    }, [reportDataResponse, reportError, callType]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleLoadReport = () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }

        setLoading(true);
        fetchReport(
            null,
            'Get',
            `${baseUrl}/api/grh/paie/paiements-a-effectuer/${selectedPeriode.periodeId}`,
            'loadReport'
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `Paiements_A_Effectuer_${selectedPeriode?.periodeId || 'report'}`,
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 10mm 10mm 20mm 10mm;
                @bottom-center {
                    content: "Page " counter(page) " de " counter(pages);
                    font-size: 10px;
                    font-family: Arial, sans-serif;
                }
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

    const openPrintDialog = () => {
        if (!reportData) {
            showToast('warn', 'Attention', 'Veuillez d\'abord charger les donnees.');
            return;
        }
        setPrintDialogVisible(true);
    };

    const formatNumber = (value: number | undefined | null): string => {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getMonthName = (mois: number): string => {
        const months = [
            'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
        ];
        return mois >= 1 && mois <= 12 ? months[mois - 1] : String(mois);
    };

    const periodeOptionTemplate = (option: PeriodePaie) => {
        return (
            <div className="flex align-items-center">
                <span>{getMonthName(option.mois)} / {option.annee}</span>
            </div>
        );
    };

    const selectedPeriodeTemplate = (option: PeriodePaie | null) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <span>{getMonthName(option.mois)} / {option.annee}</span>
                </div>
            );
        }
        return <span>Selectionner une periode</span>;
    };

    const renderReport = () => {
        if (!reportData) return null;

        return (
            <div className="p-4" style={{ backgroundColor: 'white' }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-primary m-0">
                        LES PAIEMENTS A EFFECTUER
                    </h2>
                    <h3 className="m-0 mt-2">
                        POUR LE MOIS DE {reportData.periodeLibelle}
                    </h3>
                </div>

                {/* Report Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="border-1 border-300 px-3 py-2 text-left" style={{ width: '60%' }}>Banque</th>
                                <th className="border-1 border-300 px-3 py-2 text-right" style={{ width: '40%' }}>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Bank Payments */}
                            {reportData.banquePayments.map((bank, index) => (
                                <tr key={`bank-${index}`}>
                                    <td className="border-1 border-300 px-3 py-2">{bank.libelleBanque}</td>
                                    <td className="border-1 border-300 px-3 py-2 text-right">{formatNumber(bank.montant)}</td>
                                </tr>
                            ))}

                            {/* Total Banque */}
                            <tr className="bg-blue-50">
                                <td className="border-1 border-300 px-3 py-2 text-right font-bold">Total Banque:</td>
                                <td className="border-1 border-300 px-3 py-2 text-right font-bold">{formatNumber(reportData.totalBanque)}</td>
                            </tr>

                            {/* Empty row for separation */}
                            <tr>
                                <td colSpan={2} className="border-0 py-2"></td>
                            </tr>

                            {/* Retenue Payments */}
                            {reportData.retenuePayments.map((retenue, index) => (
                                <tr key={`retenue-${index}`}>
                                    <td className="border-1 border-300 px-3 py-2">{retenue.libelleRet}</td>
                                    <td className="border-1 border-300 px-3 py-2 text-right">{formatNumber(retenue.montant)}</td>
                                </tr>
                            ))}

                            {/* Total Retenue */}
                            <tr className="bg-yellow-50">
                                <td className="border-1 border-300 px-3 py-2 text-right font-bold">Total Retenue:</td>
                                <td className="border-1 border-300 px-3 py-2 text-right font-bold">{formatNumber(reportData.totalRetenue)}</td>
                            </tr>

                            {/* Empty row for separation */}
                            <tr>
                                <td colSpan={2} className="border-0 py-2"></td>
                            </tr>

                            {/* Total General */}
                            <tr className="bg-green-100">
                                <td className="border-1 border-300 px-3 py-2 text-left font-bold">Total General:</td>
                                <td className="border-1 border-300 px-3 py-2 text-right font-bold text-primary">{formatNumber(reportData.totalGeneral)}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Paiements a Effectuer</h5>

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
                    <div className="field col-12 md:col-3">
                        <label htmlFor="periode">Periode</label>
                        <Dropdown
                            id="periode"
                            value={selectedPeriode}
                            options={periodes}
                            onChange={(e) => setSelectedPeriode(e.value)}
                            optionLabel="periodeId"
                            itemTemplate={periodeOptionTemplate}
                            valueTemplate={selectedPeriodeTemplate}
                            placeholder="Selectionner une periode"
                            className="w-full"
                            loading={loadingPeriodes}
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-2 flex align-items-end">
                        <Button
                            icon="pi pi-search"
                            label="Charger"
                            onClick={handleLoadReport}
                            loading={loading}
                            className="w-full"
                        />
                    </div>
                    {reportData && (
                        <div className="field col-12 md:col-2 flex align-items-end">
                            <Button
                                icon="pi pi-print"
                                label="Imprimer"
                                onClick={openPrintDialog}
                                severity="success"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-content-center align-items-center p-5">
                        <ProgressSpinner />
                    </div>
                )}

                {/* Report Display */}
                {!loading && reportData && renderReport()}

                {/* No Data Message */}
                {!loading && reportData && reportData.banquePayments.length === 0 && reportData.retenuePayments.length === 0 && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour cette periode.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header="Apercu d'impression - Paiements a Effectuer"
                visible={printDialogVisible}
                style={{ width: '90vw', maxWidth: '800px' }}
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
                    {reportData && (
                        <PrintablePaiementsAEffectuer
                            ref={printableRef}
                            reportData={reportData}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default PaiementsAEffectuerComponent;
