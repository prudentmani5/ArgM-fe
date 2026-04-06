'use client';
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';

interface CancellationRefDropdownProps {
    /** Which source type to filter: DEPOSIT, WITHDRAWAL, VIREMENT */
    sourceType: string;
    /** Currently selected cancellation request number (e.g. "ANN-20260406-00001") */
    value?: string;
    /** Called with the selected cancellation request number or null */
    onChange: (ref: string | null, item: any | null) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * Optional dropdown that shows approved cancellation requests for a given
 * source type. When the caissier selects one, the parent form stores the
 * reference so it can be prepended to the notes field before submitting.
 */
const CancellationRefDropdown: React.FC<CancellationRefDropdownProps> = ({
    sourceType,
    value,
    onChange,
    disabled = false,
    className = 'w-full'
}) => {
    const [options, setOptions] = useState<any[]>([]);
    const api = useConsumApi('');

    useEffect(() => {
        api.fetchData(null, 'GET',
            `${API_BASE_URL}/api/epargne/cancellation-requests/approved-not-replaced`,
            'loadApproved');
    }, []);

    useEffect(() => {
        if (api.data) {
            const all = Array.isArray(api.data) ? api.data : [];
            const filtered = all.filter((r: any) => r.sourceType === sourceType);
            setOptions(filtered);
        }
    }, [api.data, sourceType]);

    const itemTemplate = (item: any) => {
        if (!item) return null;
        return (
            <span>
                <strong>{item.requestNumber}</strong>
                {' — '}{item.sourceReference || ''}
                {item.clientName ? ` — ${item.clientName}` : ''}
                {item.amount != null ? ` — ${new Intl.NumberFormat('fr-FR').format(item.amount)} BIF` : ''}
            </span>
        );
    };

    if (options.length === 0) return null;

    return (
        <div className="field">
            <label className="font-medium">
                <i className="pi pi-replay mr-1" style={{ fontSize: '0.85rem' }}></i>
                Remplacement d'une opération annulée (optionnel)
            </label>
            <Dropdown
                value={value}
                options={options}
                onChange={(e) => {
                    const selected = options.find((o: any) => o.requestNumber === e.value);
                    onChange(e.value || null, selected || null);
                }}
                optionLabel="requestNumber"
                optionValue="requestNumber"
                placeholder="Sélectionner l'annulation à remplacer..."
                showClear
                filter
                filterBy="requestNumber,sourceReference,clientName"
                itemTemplate={itemTemplate}
                valueTemplate={(item: any, props: any) => item ? itemTemplate(item) : <span>{props?.placeholder}</span>}
                disabled={disabled}
                className={className}
                emptyMessage="Aucune annulation approuvée pour ce type"
            />
            <small className="text-500">Si cette transaction remplace une opération annulée, sélectionnez la référence ici</small>
        </div>
    );
};

export default CancellationRefDropdown;
