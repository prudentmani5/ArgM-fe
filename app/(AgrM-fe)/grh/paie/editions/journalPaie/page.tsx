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
import { JournalPaieResponseDto, JournalPaieServiceGroupDto, JournalPaieEmployeeDto } from './JournalPaie';
import { API_BASE_URL } from '@/utils/apiConfig';
import PrintableJournalPaie from './PrintableJournalPaie';

const JournalPaieComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [journalData, setJournalData] = useState<JournalPaieResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');
    const { data: journalDataResponse, error: journalError, fetchData: fetchJournal, callType } = useConsumApi('');

    // Load periodes by year
    useEffect(() => {
        setLoadingPeriodes(true);
        setSelectedPeriode(null); // Reset period selection when year changes
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

    // Handle journal data response
    useEffect(() => {
        if (journalDataResponse && callType === 'loadJournal') {
            setJournalData(journalDataResponse as JournalPaieResponseDto);
            setLoading(false);
            showToast('success', 'Succes', 'Journal de paie charge avec succes.');
        }

        if (journalError && callType === 'loadJournal') {
            showToast('error', 'Erreur', 'Impossible de charger le journal de paie.');
            setJournalData(null);
            setLoading(false);
        }
    }, [journalDataResponse, journalError, callType]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleLoadJournal = () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }

        setLoading(true);
        fetchJournal(
            null,
            'Get',
            `${baseUrl}/api/grh/paie/journal/${selectedPeriode.periodeId}`,
            'loadJournal'
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `Journal_Paie_${selectedPeriode?.periodeId || 'report'}`,
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 5mm 5mm 15mm 5mm;
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
        if (!journalData) {
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

    // Column headers for the report
    const row1Headers = ['S.Base', 'Logt', 'I.Fam', 'Deplac', 'Rap + Imp', 'Prime', 'Brut', 'Rap - Imp', 'FPC', 'INSS', 'IRE', 'Synd', 'Fonds Aval', 'Cahier', 'Quinzaine', 'Tot retenue', 'Net a payer'];
    const row2Headers = ['I.Charge', 'I.div', 'Regideso', 'H.S', 'Rap + NI', 'Rbt/Av', 'Rap - NI', 'Av.Sal', 'Ass.Vie', 'Jubilee', 'Ass.Soc', 'R.Cred', 'Loyer', 'Resto', 'BNDE', 'R.Sportif'];

    const renderEmployeeRow1 = (emp: JournalPaieEmployeeDto) => (
        <>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.sBase)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.logt)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.iFam)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.deplac)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rapPlusImp)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.prime)}</td>
            <td rowSpan={2} className="text-right border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>{formatNumber(emp.brut)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rapMoinsImp)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.fpc)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.inss)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.ipr)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.synd)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.fondsAval)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.cahier)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.quinzaine)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(emp.totRetenue)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold text-primary">{formatNumber(emp.netAPayer)}</td>
        </>
    );

    const renderEmployeeRow2 = (emp: JournalPaieEmployeeDto) => (
        <>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.iCharge)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.iDiv)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.regideso)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.hs)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rapPlusNI)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rbtAv)}</td>
            {/* Brut column has rowSpan=2 from row1, so no cell here */}
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rapMoinsNI)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.avSal)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.assVie)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.jubilee)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.assSoc)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rCred)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.loyer)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.reste)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.bnde)}</td>
            <td className="text-right border-1 border-300 px-1">{formatNumber(emp.rSportif)}</td>
        </>
    );

    const renderServiceTotalRow1 = (group: JournalPaieServiceGroupDto) => (
        <>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalSBase)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalLogt)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalIFam)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalDeplac)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRapPlusImp)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalPrime)}</td>
            <td rowSpan={2} className="text-right border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>{formatNumber(group.totalBrut)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRapMoinsImp)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalFpc)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalInss)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalIpr)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalSynd)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalFondsAval)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalCahier)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalQuinzaine)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalTotRetenue)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold text-primary">{formatNumber(group.totalNetAPayer)}</td>
        </>
    );

    const renderServiceTotalRow2 = (group: JournalPaieServiceGroupDto) => (
        <>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalICharge)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalIDiv)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRegideso)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalHs)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRapPlusNI)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRbtAv)}</td>
            {/* Brut column has rowSpan=2 from row1, so no cell here */}
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRapMoinsNI)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalAvSal)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalAssVie)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalJubilee)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalAssSoc)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRCred)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalLoyer)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalReste)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalBnde)}</td>
            <td className="text-right border-1 border-300 px-1 font-bold">{formatNumber(group.totalRSportif)}</td>
        </>
    );

    const renderReport = () => {
        if (!journalData) return null;

        return (
            <div ref={printRef} className="p-4" style={{ backgroundColor: 'white' }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-primary m-0">
                        JOURNAL DE PAIE PAR AFFECTATION
                    </h2>
                    <h3 className="m-0 mt-2">
                        Période {journalData.periodeLibelle}
                    </h3>
                </div>

                {/* Report Table */}
                <div style={{ overflowX: 'auto' }}>
                    {journalData.serviceGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-4">
                            {/* Service Header */}
                            <div className="bg-primary-100 p-2 font-bold text-lg border-1 border-300">
                                {group.serviceLibelle}
                            </div>

                            <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead>
                                    {/* Column Headers Row 1 */}
                                    <tr className="bg-blue-100">
                                        <th rowSpan={2} className="border-1 border-300 px-1 text-left" style={{ width: '50px', verticalAlign: 'middle' }}>Matr</th>
                                        <th rowSpan={2} className="border-1 border-300 px-1 text-left" style={{ width: '150px', verticalAlign: 'middle' }}>Nom et Prenom</th>
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
                                    {group.employees.map((emp, empIndex) => (
                                        <>
                                            {/* Employee Row 1 */}
                                            <tr key={`${empIndex}-row1`}>
                                                <td rowSpan={2} className="border-1 border-300 px-1 font-bold" style={{ verticalAlign: 'middle' }}>{emp.matriculeId}</td>
                                                <td rowSpan={2} className="border-1 border-300 px-1" style={{ verticalAlign: 'middle' }}>{emp.getFullName ? emp.getFullName() : `${emp.nom || ''} ${emp.prenom || ''}`.trim()}</td>
                                                {renderEmployeeRow1(emp)}
                                            </tr>
                                            {/* Employee Row 2 */}
                                            <tr key={`${empIndex}-row2`} className="bg-gray-50">
                                                {renderEmployeeRow2(emp)}
                                            </tr>
                                        </>
                                    ))}
                                    {/* Service Total Row 1 */}
                                    <tr className="bg-yellow-100">
                                        <td colSpan={2} rowSpan={2} className="border-1 border-300 px-1 font-bold text-center" style={{ verticalAlign: 'middle' }}>Total pour {group.employeeCount} employé(s)</td>
                                        {renderServiceTotalRow1(group)}
                                    </tr>
                                    {/* Service Total Row 2 */}
                                    <tr className="bg-yellow-50">
                                        {renderServiceTotalRow2(group)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {/* Grand Total Section */}
                    <div className="mt-4">
                        <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                            <tbody>
                                <tr className="bg-green-100">
                                    <td colSpan={2} rowSpan={4} className="border-1 border-300 px-1 text-center font-bold" style={{ width: '200px', verticalAlign: 'middle' }}>Total pour {journalData.totalEmployeeCount} employé(s)</td>
                                    {row1Headers.map((header, idx) => (
                                        <td
                                            key={idx}
                                            rowSpan={idx === 6 ? 2 : 1}
                                            className="border-1 border-300 px-1 text-center font-bold"
                                            style={{ minWidth: '60px', verticalAlign: idx === 6 ? 'middle' : undefined }}
                                        >
                                            {header}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-green-50">
                                    {row2Headers.map((header, idx) => (
                                        <td key={idx} className="border-1 border-300 px-1 text-center font-bold" style={{ minWidth: '60px' }}>
                                            {header}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-green-200 font-bold">
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalSBase)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalLogt)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalIFam)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalDeplac)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRapPlusImp)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalPrime)}</td>
                                    <td rowSpan={2} className="text-right border-1 border-300 px-1" style={{ verticalAlign: 'middle' }}>{formatNumber(journalData.grandTotalBrut)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRapMoinsImp)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalFpc)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalInss)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalIpr)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalSynd)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalFondsAval)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalCahier)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalQuinzaine)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalTotRetenue)}</td>
                                    <td className="text-right border-1 border-300 px-1 text-primary">{formatNumber(journalData.grandTotalNetAPayer)}</td>
                                </tr>
                                <tr className="bg-green-100 font-bold">
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalICharge)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalIDiv)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRegideso)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalHs)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRapPlusNI)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRbtAv)}</td>
                                    {/* Brut column has rowSpan=2 from row above, so no cell here */}
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRapMoinsNI)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalAvSal)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalAssVie)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalJubilee)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalAssSoc)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRCred)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalLoyer)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalReste)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalBnde)}</td>
                                    <td className="text-right border-1 border-300 px-1">{formatNumber(journalData.grandTotalRSportif)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Journal de Paie par Affectation</h5>

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
                        <label htmlFor="periode">Période</label>
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
                            onClick={handleLoadJournal}
                            loading={loading}
                            className="w-full"
                        />
                    </div>
                    {journalData && (
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
                {!loading && journalData && renderReport()}

                {/* No Data Message */}
                {!loading && journalData && journalData.serviceGroups.length === 0 && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour cette periode.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header="Apercu d'impression - Journal de Paie"
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
                    {journalData && (
                        <PrintableJournalPaie
                            ref={printableRef}
                            journalData={journalData}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default JournalPaieComponent;
