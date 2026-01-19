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
import { ListingIreResponseDto, ListingIreEmployeeDto } from './ListingIre';
import { API_BASE_URL } from '@/utils/apiConfig';
import PrintableListingIre from './PrintableListingIre';

const ListingIreComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [listingData, setListingData] = useState<ListingIreResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');
    const { data: listingDataResponse, error: listingError, fetchData: fetchListing, callType } = useConsumApi('');

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

    // Handle listing data response
    useEffect(() => {
        if (listingDataResponse && callType === 'loadListing') {
            setListingData(listingDataResponse as ListingIreResponseDto);
            setLoading(false);
            showToast('success', 'Succes', 'Listing IRE charge avec succes.');
        }

        if (listingError && callType === 'loadListing') {
            showToast('error', 'Erreur', 'Impossible de charger le listing IRE.');
            setListingData(null);
            setLoading(false);
        }
    }, [listingDataResponse, listingError, callType]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleLoadListing = () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }

        setLoading(true);
        fetchListing(
            null,
            'Get',
            `${baseUrl}/api/grh/paie/listing-ire/${selectedPeriode.periodeId}`,
            'loadListing'
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `Listing_IRE_${selectedPeriode?.periodeId || 'report'}`,
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
        if (!listingData) {
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
        if (!listingData) return null;

        return (
            <div ref={printRef} className="p-4" style={{ backgroundColor: 'white' }}>
                {/* Header */}
                <div className="flex align-items-center mb-4">
                    <div style={{ flex: '0 0 80px' }}>
                        <span className="font-bold text-xl">G.P.S.B</span>
                    </div>
                    <div className="flex-1 text-center">
                        <h2 className="text-primary m-0">
                            DECLARATION DE L' IRE : {listingData.periodeLibelle}
                        </h2>
                    </div>
                </div>

                {/* Report Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                            {/* Main Header Row */}
                            <tr className="bg-blue-100">
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '180px', verticalAlign: 'middle' }}>Nom</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '60px', verticalAlign: 'middle' }}>Base</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '50px', verticalAlign: 'middle' }}>Logt</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '50px', verticalAlign: 'middle' }}>Deplac</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '60px', verticalAlign: 'middle' }}>Brut</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '50px', verticalAlign: 'middle' }}>Inss</th>
                                <th colSpan={2} className="border-1 border-300 px-1 text-center">Tranche de 0 - 1500000</th>
                                <th colSpan={2} className="border-1 border-300 px-1 text-center">Tranche de 150001 - 300000</th>
                                <th colSpan={2} className="border-1 border-300 px-1 text-center">Tranche de plus de 300000</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '70px', verticalAlign: 'middle' }}>Brut<br/>Imposable</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '60px', verticalAlign: 'middle' }}>IRE</th>
                                <th rowSpan={2} className="border-1 border-300 px-1 text-center" style={{ width: '70px', verticalAlign: 'middle' }}>Net</th>
                            </tr>
                            {/* Sub Header Row */}
                            <tr className="bg-blue-50">
                                <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Imposable a 0%</th>
                                <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Impot du</th>
                                <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Imposable a 20%</th>
                                <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Impot du</th>
                                <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Imposable a 30%</th>
                                <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Impot du</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listingData.employees.map((emp, index) => (
                                <tr key={index}>
                                    <td className="border-1 border-300 px-1 text-left text-red-700">{emp.nom || ''} {emp.prenom || ''}</td>
                                    <td className="border-1 border-300 px-1 text-right text-primary">{formatNumber(emp.base)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-primary">{formatNumber(emp.logt)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-primary">{formatNumber(emp.deplac)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-primary">{formatNumber(emp.brut)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-primary">{formatNumber(emp.inss)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.bracket1Imposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.bracket1Tax)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.bracket2Imposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.bracket2Tax)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.bracket3Imposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.bracket3Tax)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.brutImposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.ire)}</td>
                                    <td className="border-1 border-300 px-1 text-right text-red-700">{formatNumber(emp.net)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Grand Total Section */}
                    <div className="mt-4">
                        <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead>
                                <tr className="bg-blue-100">
                                    <th className="border-1 border-300 px-1 text-center" style={{ width: '180px' }}>Nom</th>
                                    <th className="border-1 border-300 px-1 text-center">Base</th>
                                    <th className="border-1 border-300 px-1 text-center">Logt</th>
                                    <th className="border-1 border-300 px-1 text-center">Deplac</th>
                                    <th className="border-1 border-300 px-1 text-center">Brut</th>
                                    <th className="border-1 border-300 px-1 text-center">Inss</th>
                                    <th colSpan={2} className="border-1 border-300 px-1 text-center">Tranche de 0 - 1500000</th>
                                    <th colSpan={2} className="border-1 border-300 px-1 text-center">Tranche de 150001 - 300000</th>
                                    <th colSpan={2} className="border-1 border-300 px-1 text-center">Tranche de plus de 300000</th>
                                    <th className="border-1 border-300 px-1 text-center">Brut<br/>Imposable</th>
                                    <th className="border-1 border-300 px-1 text-center">IRE</th>
                                    <th className="border-1 border-300 px-1 text-center">Net</th>
                                </tr>
                                <tr className="bg-blue-50">
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Imposable a 0%</th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Impot du</th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Imposable a 20%</th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Impot du</th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Imposable a 30%</th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}>Impot du</th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                    <th className="border-1 border-300 px-1 text-center" style={{ fontSize: '10px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-green-100 font-bold">
                                    <td className="border-1 border-300 px-1 text-center">{listingData.totalEmployeeCount}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBase)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalLogt)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalDeplac)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBrut)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalInss)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBracket1Imposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBracket1Tax)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBracket2Imposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBracket2Tax)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBracket3Imposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBracket3Tax)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalBrutImposable)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalIre)}</td>
                                    <td className="border-1 border-300 px-1 text-right">{formatNumber(listingData.grandTotalNet)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer - Signature Section */}
                    <div className="flex justify-content-between mt-6 font-bold" style={{ fontSize: '12px' }}>
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
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Listing IRE - Declaration de l'Impot sur les Revenues d'Emploi</h5>

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
                            onClick={handleLoadListing}
                            loading={loading}
                            className="w-full"
                        />
                    </div>
                    {listingData && (
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
                {!loading && listingData && renderReport()}

                {/* No Data Message */}
                {!loading && listingData && listingData.employees.length === 0 && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour cette periode.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header="Apercu d'impression - Listing IRE"
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
                    {listingData && (
                        <PrintableListingIre
                            ref={printableRef}
                            listingData={listingData}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default ListingIreComponent;
