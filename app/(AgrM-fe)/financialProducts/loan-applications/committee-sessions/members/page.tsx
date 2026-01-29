'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSearchParams } from 'next/navigation';
import { LoanCommitteeMember, MemberRoleLabels, MemberRoleColors, MemberRoleIcons } from './LoanCommitteeMember';
import LoanCommitteeMemberForm from './LoanCommitteeMemberForm';

const LoanCommitteeMemberPage = () => {
    const [members, setMembers] = useState<LoanCommitteeMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<LoanCommitteeMember | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    useEffect(() => {
        if (sessionId) {
            fetchMembers();
        }
    }, [sessionId]);

    const fetchMembers = async () => {
        if (!sessionId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/financial-products/loan-applications/committee-sessions/${sessionId}/members/`
            );
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Failed to fetch committee members',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to fetch committee members',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setSelectedMember(null);
        setDialogVisible(true);
    };

    const editMember = (member: LoanCommitteeMember) => {
        setSelectedMember(member);
        setDialogVisible(true);
    };

    const deleteMember = (member: LoanCommitteeMember) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer this committee member?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(
                        `/api/financial-products/loan-applications/committee-sessions/${sessionId}/members/${member.id}`,
                        { method: 'DELETE' }
                    );

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Committee member supprimé avec succès',
                            life: 3000
                        });
                        fetchMembers();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la suppression de committee member',
                        life: 3000
                    });
                }
            }
        });
    };

    const saveMember = async (member: LoanCommitteeMember) => {
        try {
            const url = member.id
                ? `/api/financial-products/loan-applications/committee-sessions/${sessionId}/members/${member.id}`
                : `/api/financial-products/loan-applications/committee-sessions/${sessionId}/members/`;

            const method = member.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Committee member ${member.id ? 'updated' : 'added'} successfully`,
                    life: 3000
                });
                setDialogVisible(false);
                fetchMembers();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Failed to ${member.id ? 'update' : 'add'} committee member`,
                life: 3000
            });
        }
    };

    const roleBodyTemplate = (rowData: LoanCommitteeMember) => {
        return (
            <Tag
                value={MemberRoleLabels[rowData.role]}
                severity={MemberRoleColors[rowData.role] as any}
                icon={`pi ${MemberRoleIcons[rowData.role]}`}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanCommitteeMember) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-success"
                    onClick={() => editMember(rowData)}
                    tooltip="Edit"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteMember(rowData)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Add Member"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                    disabled={!sessionId}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <InputText
                type="search"
                placeholder="Rechercher..."
                onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                className="w-full md:w-auto"
            />
        );
    };

    if (!sessionId) {
        return (
            <div className="card">
                <div className="text-center p-5">
                    <i className="pi pi-exclamation-circle text-4xl text-orange-500"></i>
                    <p className="text-xl mt-3">Please select a committee session to view members</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
                value={members}
                loading={loading}
                globalFilter={globalFilter}
                emptyMessage="No committee members found."
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} members"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            >
                <Column
                    field="user"
                    header="User"
                    sortable
                />
                <Column
                    field="role"
                    header="Role"
                    body={roleBodyTemplate}
                    sortable
                />
                <Column
                    field="notes"
                    header="Notes"
                    style={{ minWidth: '200px' }}
                />
                <Column
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ minWidth: '120px' }}
                />
            </DataTable>

            <LoanCommitteeMemberForm
                visible={dialogVisible}
                member={selectedMember}
                sessionId={sessionId ? parseInt(sessionId) : undefined}
                onHide={() => setDialogVisible(false)}
                onSave={saveMember}
            />
        </div>
    );
};

export default LoanCommitteeMemberPage;
