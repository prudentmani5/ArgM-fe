'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from 'react-to-print';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import {
    ListingRetenueBhbResponseDto,
    ListingRetenueBhbEmployeeDto,
    formatCurrency,
    getFullName
} from './ListingRetenueBhb';
import { API_BASE_URL } from '@/utils/apiConfig';
import PrintableListingRetenueBhb from './PrintableListingRetenueBhb';

const ListingRetenueBhbComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [reportData, setReportData] = useState<ListingRetenueBhbResponseDto | null>(null);
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
            setReportData(reportDataResponse as ListingRetenueBhbResponseDto);
            setLoading(false);
            showToast('success', 'Succes', 'Donnees chargees avec succes.');
        }

        if (reportError && callType === 'loadReport') {
            showToast('error', 'Erreur', 'Impossible de charger les donnees.');
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
        const url = `${baseUrl}/api/grh/paie/listing-retenue-bhb/${selectedPeriode.periodeId}`;
        fetchReport(null, 'Get', url, 'loadReport');
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `ListingRetenueBHB_${selectedPeriode?.periodeId || 'report'}`,
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

    const openPrintDialog = () => {
        setPrintDialogVisible(true);
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

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Listing des Retenues BHB</h5>

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
                            placeholder="Selectionner"
                            className="w-full"
                            loading={loadingPeriodes}
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-3 flex align-items-end gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Charger"
                            onClick={handleLoadReport}
                            loading={loading}
                        />
                        {reportData && reportData.employees.length > 0 && (
                            <Button
                                icon="pi pi-print"
                                label="Imprimer"
                                severity="info"
                                onClick={openPrintDialog}
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
                {!loading && reportData && (
                    <div>
                        {/* Header Info */}
                        <div className="surface-100 p-3 border-round mb-4">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="text-lg font-bold text-primary mb-2">
                                        {reportData.periodeLibelle}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Banque: </span>
                                        <span className="text-blue-700 font-bold">{reportData.banqueLibelle}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Retenue: </span>
                                        <span className="font-bold">{reportData.retenueLibelle}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6 text-right">
                                    <div className="text-lg font-bold">
                                        Total: {reportData.totalEmployeeCount} employes
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {formatCurrency(reportData.grandTotalMontant)} BIF
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employee Table */}
                        <DataTable
                            value={reportData.employees}
                            size="small"
                            stripedRows
                            emptyMessage="Aucun employe"
                            paginator
                            rows={20}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                        >
                            <Column field="matriculeId" header="Matricule" style={{ width: '100px' }} />
                            <Column field="compte" header="Compte" />
                            <Column
                                header="Nom et Prenom"
                                body={(row: ListingRetenueBhbEmployeeDto) => (
                                    <span className="text-red-700">{getFullName(row)}</span>
                                )}
                            />
                            <Column
                                header="Montant"
                                body={(row: ListingRetenueBhbEmployeeDto) => formatCurrency(row.montant)}
                                style={{ textAlign: 'right', width: '120px' }}
                            />
                        </DataTable>

                        {/* Footer Summary */}
                        <div className="flex justify-content-between mt-3 pt-2 border-top-1 border-300">
                            <span className="font-bold">{reportData.totalEmployeeCount} Employes</span>
                            <span className="font-bold">{formatCurrency(reportData.grandTotalMontant)} BIF</span>
                        </div>
                    </div>
                )}

                {/* No Data Message */}
                {!loading && reportData && reportData.employees.length === 0 && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour cette periode.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header={`Apercu d'impression - Listing Retenue BHB`}
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
                    {reportData && (
                        <PrintableListingRetenueBhb
                            ref={printableRef}
                            data={reportData}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default ListingRetenueBhbComponent;
