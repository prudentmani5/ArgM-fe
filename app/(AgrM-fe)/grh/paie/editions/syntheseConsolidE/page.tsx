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
import { SyntheseConsolideResponseDto } from './SyntheseConsolide';
import { API_BASE_URL } from '@/utils/apiConfig';
import PrintableSyntheseConsolide from './PrintableSyntheseConsolide';

const SyntheseConsolideComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [syntheseData, setSyntheseData] = useState<SyntheseConsolideResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');
    const { data: syntheseDataResponse, error: syntheseError, fetchData: fetchSynthese, callType } = useConsumApi('');

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

    // Handle synthese data response
    useEffect(() => {
        if (syntheseDataResponse && callType === 'loadSynthese') {
            setSyntheseData(syntheseDataResponse as SyntheseConsolideResponseDto);
            setLoading(false);
            showToast('success', 'Succes', 'Synthese consolidee chargee avec succes.');
        }

        if (syntheseError && callType === 'loadSynthese') {
            showToast('error', 'Erreur', 'Impossible de charger la synthese consolidee.');
            setSyntheseData(null);
            setLoading(false);
        }
    }, [syntheseDataResponse, syntheseError, callType]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleLoadSynthese = () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }

        setLoading(true);
        fetchSynthese(
            null,
            'Get',
            `${baseUrl}/api/grh/paie/synthese-consolide/${selectedPeriode.periodeId}`,
            'loadSynthese'
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `Synthese_Consolidee_${selectedPeriode?.periodeId || 'report'}`,
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 5mm;
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
        if (!syntheseData) {
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
        return <span>Sélectionner une période</span>;
    };

    // Column headers for the report
    const row1Headers = ['S.Base', 'Logt', 'I.Fam', 'Deplac', 'Rap + Imp', 'Prime', 'Brut', 'Rap - Imp', 'FPC', 'INSS', 'IRE', 'Synd', 'Fonds Aval', 'Cahier', 'Quinzaine', 'Tot retenue', 'Net a payer'];
    const row2Headers = ['I.Charge', 'I.div', 'Regideso', 'H.S', 'Rap + NI', 'Rbt/Av', 'Rap - NI', 'Av.Sal', 'Ass.Vie', 'Jubilee', 'Ass.Soc', 'R.Cred', 'Loyer', 'Resto', 'Remb/AV'];

    const renderReport = () => {
        if (!syntheseData) return null;

        return (
            <div ref={printRef} className="p-4" style={{ backgroundColor: 'white' }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="m-0" style={{ color: '#800020', textDecoration: 'underline' }}>
                        SYNTHESE
                    </h2>
                    <h3 className="m-0 mt-2" style={{ color: '#800020', textDecoration: 'underline' }}>
                        Période {syntheseData.periodeLibelle}
                    </h3>
                </div>

                {/* Report Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                            {/* Column Headers Row 1 */}
                            <tr className="bg-blue-100">
                                <th rowSpan={2} className="border-1 border-300 px-1" style={{ width: '80px', verticalAlign: 'middle' }}></th>
                                {row1Headers.map((header, idx) => (
                                    <th
                                        key={idx}
                                        rowSpan={idx === 6 ? 2 : 1}
                                        className="border-1 border-300 px-1 text-center"
                                        style={{ minWidth: '60px', verticalAlign: idx === 6 ? 'middle' : undefined }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            {/* Column Headers Row 2 */}
                            <tr className="bg-blue-50">
                                {row2Headers.map((header, idx) => (
                                    <th key={idx} className="border-1 border-300 px-1 text-center" style={{ minWidth: '60px' }}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Employe Row 1 */}
                            <tr>
                                <td rowSpan={2} className="border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>Employé</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeSBase)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeLogt)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeIFam)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeDeplac)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRapPlusImp)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employePrime)}</td>
                                <td rowSpan={2} className="text-right border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>{formatNumber(syntheseData.employeBrut)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRapMoinsImp)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeFpc)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeInss)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeIpr)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeSynd)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeFondsAval)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeCahier)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeQuinzaine)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeTotRetenue)}</td>
                                <td rowSpan={2} className="text-right border-1 border-300 px-1 font-bold text-primary" style={{ verticalAlign: 'middle' }}>{formatNumber(syntheseData.employeNetAPayer)}</td>
                            </tr>
                            {/* Employe Row 2 */}
                            <tr className="bg-gray-50">
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeICharge)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeIDiv)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRegideso)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeHs)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRapPlusNI)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRbtAv)}</td>
                                {/* Brut column has rowSpan=2 */}
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRapMoinsNI)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeAvSal)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeAssVie)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeJubilee)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeAssSoc)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRCred)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeLoyer)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeReste)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeRSportif)}</td>
                                {/* Net a payer has rowSpan=2 */}
                            </tr>

                            {/* Empty row for spacing */}
                            <tr>
                                <td colSpan={18} style={{ height: '10px', border: 'none' }}></td>
                            </tr>

                            {/* Employeur Row */}
                            <tr>
                                <td className="border-1 border-300 px-1 font-bold">Employeur</td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeurFpc)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.employeurInss)}</td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                                <td className="border-1 border-300 px-1"></td>
                            </tr>

                            {/* Empty row for spacing */}
                            <tr>
                                <td colSpan={18} style={{ height: '10px', border: 'none' }}></td>
                            </tr>

                            {/* TOTAL Row 1 */}
                            <tr className="bg-green-100">
                                <td rowSpan={2} className="border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>TOTAL</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalSBase)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalLogt)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalIFam)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalDeplac)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRapPlusImp)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalPrime)}</td>
                                <td rowSpan={2} className="text-right border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>{formatNumber(syntheseData.totalBrut)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRapMoinsImp)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalFpc)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalInss)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalIpr)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalSynd)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalFondsAval)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalCahier)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalQuinzaine)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalTotRetenue)}</td>
                                <td rowSpan={2} className="text-right border-1 border-300 px-1 font-bold text-primary" style={{ verticalAlign: 'middle' }}>{formatNumber(syntheseData.totalNetAPayer)}</td>
                            </tr>
                            {/* TOTAL Row 2 */}
                            <tr className="bg-green-50">
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalICharge)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalIDiv)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRegideso)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalHs)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRapPlusNI)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRbtAv)}</td>
                                {/* Brut column has rowSpan=2 */}
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRapMoinsNI)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalAvSal)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalAssVie)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalJubilee)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalAssSoc)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRCred)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalLoyer)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalReste)}</td>
                                <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(syntheseData.totalRSportif)}</td>
                                {/* Net a payer has rowSpan=2 */}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer with signature sections */}
                <div className="mt-6 flex justify-content-between" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    <div className="text-center" style={{ width: '30%' }}>
                        <p className="m-0">POUR ETABLISSEMENT</p>
                    </div>
                    <div className="text-center" style={{ width: '30%' }}>
                        <p className="m-0">POUR VERIFICATION</p>
                    </div>
                    <div className="text-center" style={{ width: '30%' }}>
                        <p className="m-0">POUR AUTORISATION</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Synthese Consolidee</h5>

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
                            placeholder="Sélectionner une période"
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
                            onClick={handleLoadSynthese}
                            loading={loading}
                            className="w-full"
                        />
                    </div>
                    {syntheseData && (
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
                {!loading && syntheseData && renderReport()}

                {/* No Data Message */}
                {!loading && !syntheseData && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Sélectionnez une période et cliquez sur Charger pour afficher la synthèse.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header="Apercu d'impression - Synthese Consolidee"
                visible={printDialogVisible}
                style={{ width: '95vw', maxWidth: '1400px' }}
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
                    {syntheseData && (
                        <PrintableSyntheseConsolide
                            ref={printableRef}
                            syntheseData={syntheseData}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default SyntheseConsolideComponent;
