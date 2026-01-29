'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { useSearchParams } from 'next/navigation';
import { LoanCapacitySummary } from './LoanCapacitySummary';
import { LoanCapacitySummaryForm } from './LoanCapacitySummaryForm';

export default function LoanCapacitySummaryPage() {
    const [summary, setSummary] = useState<LoanCapacitySummary | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = Number(searchParams.get('applicationId')) || 0;

    useEffect(() => {
        if (applicationId) {
            loadSummary();
        }
    }, [applicationId]);

    const loadSummary = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/capacity-summary/`);
            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            } else if (response.status === 404) {
                setSummary(null);
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement de capacity summary' });
        } finally {
            setLoading(false);
        }
    };

    const generateSummary = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/capacity-summary/generate/`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Capacity summary generated successfully' });
                loadSummary();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Failed to generate capacity summary' });
        } finally {
            setLoading(false);
        }
    };

    const saveSummary = async (summaryData: LoanCapacitySummary) => {
        try {
            const url = summaryData.id
                ? `/api/financial-products/loan-applications/${applicationId}/capacity-summary/${summaryData.id}/`
                : `/api/financial-products/loan-applications/${applicationId}/capacity-summary/`;

            const response = await fetch(url, {
                method: summaryData.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(summaryData)
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Capacity summary saved successfully' });
                setShowForm(false);
                loadSummary();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde de capacity summary' });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    const getAssessmentTag = (assessment: string) => {
        const config: any = {
            EXCELLENT: { severity: 'success', label: 'Excellent' },
            GOOD: { severity: 'info', label: 'Good' },
            MODERATE: { severity: 'warning', label: 'Moderate' },
            WEAK: { severity: 'warning', label: 'Weak' },
            INSUFFICIENT: { severity: 'danger', label: 'Insufficient' }
        };

        const assessmentConfig = config[assessment] || { severity: 'secondary', label: assessment };
        return <Tag value={assessmentConfig.label} severity={assessmentConfig.severity} />;
    };

    const getDTIColor = (ratio: number) => {
        if (ratio <= 30) return '#22c55e';
        if (ratio <= 40) return '#3b82f6';
        if (ratio <= 50) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div className="card">
                <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                </div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="card">
                <Toast ref={toast} />
                <div className="text-center p-5">
                    <i className="pi pi-chart-line text-6xl text-gray-400 mb-4"></i>
                    <h3>No Capacity Summary Available</h3>
                    <p className="text-gray-600 mb-4">
                        Generate a capacity summary based on income and expense analysis
                    </p>
                    <Button
                        label="Generate Summary"
                        icon="pi pi-plus-circle"
                        onClick={generateSummary}
                        loading={loading}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h3>Loan Capacity Summary (Application #{applicationId})</h3>
                <div className="flex gap-2">
                    <Button
                        label="Regenerate"
                        icon="pi pi-refresh"
                        onClick={generateSummary}
                        loading={loading}
                    />
                    <Button
                        label="Modifier"
                        icon="pi pi-pencil"
                        onClick={() => setShowForm(true)}
                    />
                </div>
            </div>

            {/* Income Section */}
            <Card title="Income Summary" className="mb-3">
                <div className="p-3 bg-green-50 border-round">
                    <div className="flex justify-content-between align-items-center">
                        <span className="text-lg font-semibold">Total Monthly Income:</span>
                        <span className="text-2xl font-bold text-green-700">
                            {formatCurrency(summary.totalMonthlyIncome)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Expense Section */}
            <Card title="Expense Summary" className="mb-3">
                <div className="p-3 bg-red-50 border-round">
                    <div className="flex justify-content-between align-items-center">
                        <span className="text-lg font-semibold">Total Monthly Expenses:</span>
                        <span className="text-2xl font-bold text-red-700">
                            {formatCurrency(summary.totalMonthlyExpenses)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Net Income Section */}
            <Card title="Net Income" className="mb-3">
                <div className="p-3 bg-blue-50 border-round">
                    <div className="flex justify-content-between align-items-center mb-2">
                        <span className="text-lg font-semibold">Net Monthly Income:</span>
                        <span className="text-2xl font-bold text-blue-700">
                            {formatCurrency(summary.netMonthlyIncome)}
                        </span>
                    </div>
                    <small className="text-gray-600">
                        (Total Income - Total Expenses)
                    </small>
                </div>
            </Card>

            {/* Capacity Metrics Section */}
            <Card title="Capacity Metrics" className="mb-3">
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="p-3 bg-purple-50 border-round mb-3">
                            <div className="mb-2">
                                <span className="font-semibold">Monthly Obligations:</span>
                            </div>
                            <span className="text-xl font-bold">
                                {formatCurrency(summary.monthlyObligations)}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="p-3 bg-green-50 border-round mb-3">
                            <div className="mb-2">
                                <span className="font-semibold">Available Monthly Capacity:</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">
                                {formatCurrency(summary.availableMonthlyCapacity)}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="p-3 bg-orange-50 border-round mb-3">
                            <div className="mb-2">
                                <span className="font-semibold">Proposed Monthly Payment:</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">
                                {formatCurrency(summary.proposedMonthlyPayment)}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="p-3 bg-gray-50 border-round mb-3">
                            <div className="mb-2">
                                <span className="font-semibold">Debt-to-Income Ratio:</span>
                            </div>
                            <div className="flex align-items-center gap-2 mb-2">
                                <span className="text-xl font-bold">
                                    {summary.debtToIncomeRatio.toFixed(2)}%
                                </span>
                            </div>
                            <ProgressBar
                                value={summary.debtToIncomeRatio}
                                showValue={false}
                                color={getDTIColor(summary.debtToIncomeRatio)}
                                style={{ height: '12px' }}
                            />
                            <div className="flex justify-content-between mt-2" style={{ fontSize: '0.8rem' }}>
                                <small className="text-green-600">Excellent (&lt;30%)</small>
                                <small className="text-blue-600">Good (30-40%)</small>
                                <small className="text-orange-600">Moderate (40-50%)</small>
                                <small className="text-red-600">High (&gt;50%)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Assessment Section */}
            <Card title="Capacity Assessment" className="mb-3">
                <div className="flex justify-content-between align-items-center mb-3">
                    <span className="text-lg font-semibold">Assessment:</span>
                    {getAssessmentTag(summary.capacityAssessment)}
                </div>
                {summary.analysisNotes && (
                    <div className="p-3 bg-gray-50 border-round">
                        <div className="mb-2">
                            <span className="font-semibold">Analysis Notes:</span>
                        </div>
                        <p className="m-0 text-gray-700">{summary.analysisNotes}</p>
                    </div>
                )}
                {summary.analyzedBy && (
                    <div className="mt-3">
                        <small className="text-gray-600">
                            Analyzed by: {summary.analyzedBy.name} on {summary.analyzedAt ? new Date(summary.analyzedAt).toLocaleString() : 'N/A'}
                        </small>
                    </div>
                )}
            </Card>

            <LoanCapacitySummaryForm
                visible={showForm}
                summary={summary}
                applicationId={applicationId}
                onHide={() => setShowForm(false)}
                onSave={saveSummary}
            />
        </div>
    );
}
