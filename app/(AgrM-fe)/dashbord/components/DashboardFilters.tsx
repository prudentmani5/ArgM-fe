'use client';

import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

interface DashboardFiltersProps {
    startDate: Date | null;
    endDate: Date | null;
    branchId: number | null;
    branches: any[];
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    onBranchChange: (branchId: number | null) => void;
    onApply: () => void;
    loading?: boolean;
    showBranch?: boolean;
}

export default function DashboardFilters({
    startDate, endDate, branchId, branches,
    onStartDateChange, onEndDateChange, onBranchChange, onApply,
    loading = false, showBranch = true
}: DashboardFiltersProps) {
    return (
        <div className="flex flex-wrap align-items-end gap-3 mb-4 p-3 surface-card border-round shadow-1">
            <div className="flex flex-column gap-1">
                <label className="text-sm font-medium text-500">Date début</label>
                <Calendar value={startDate} onChange={(e) => onStartDateChange(e.value as Date)}
                          dateFormat="dd/mm/yy" showIcon className="w-10rem" />
            </div>
            <div className="flex flex-column gap-1">
                <label className="text-sm font-medium text-500">Date fin</label>
                <Calendar value={endDate} onChange={(e) => onEndDateChange(e.value as Date)}
                          dateFormat="dd/mm/yy" showIcon className="w-10rem" />
            </div>
            {showBranch && (
                <div className="flex flex-column gap-1">
                    <label className="text-sm font-medium text-500">Agence</label>
                    <Dropdown value={branchId}
                              options={[{ label: 'Toutes les agences', value: null }, ...branches.map(b => ({ label: b.name, value: b.id }))]}
                              onChange={(e) => onBranchChange(e.value)}
                              placeholder="Toutes les agences"
                              className="w-14rem" />
                </div>
            )}
            <Button label="Appliquer" icon="pi pi-refresh" onClick={onApply} loading={loading}
                    className="p-button-sm" />
        </div>
    );
}
