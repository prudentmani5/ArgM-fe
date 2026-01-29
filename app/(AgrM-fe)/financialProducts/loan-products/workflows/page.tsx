"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import { Tag } from "primereact/tag";
import { LoanApprovalWorkflow } from "./LoanApprovalWorkflow";
import LoanApprovalWorkflowForm from "./LoanApprovalWorkflowForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { useSearchParams } from "next/navigation";

const LoanApprovalWorkflowPage = () => {
  const [loanApprovalWorkflows, setLoanApprovalWorkflows] = useState<LoanApprovalWorkflow[]>([]);
  const [selectedLoanApprovalWorkflow, setSelectedLoanApprovalWorkflow] = useState<LoanApprovalWorkflow | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanApprovalWorkflow[]>>(null);
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("productId") || "0");

  const { processRequest: fetchLoanApprovalWorkflows } = useConsumApi();
  const { processRequest: createLoanApprovalWorkflow } = useConsumApi();
  const { processRequest: updateLoanApprovalWorkflow } = useConsumApi();
  const { processRequest: deleteLoanApprovalWorkflow } = useConsumApi();

  useEffect(() => {
    if (productId) {
      loadLoanApprovalWorkflows();
    }
  }, [productId]);

  const loadLoanApprovalWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetchLoanApprovalWorkflows({
        route: `/api/financial-products/loan-products/workflows/product/${productId}`,
        method: "GET",
      });

      if (response?.data) {
        setLoanApprovalWorkflows(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to load loan approval workflows / Échec du chargement des flux d'approbation",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setSelectedLoanApprovalWorkflow(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanApprovalWorkflow(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanApprovalWorkflow(null);
  };

  const saveLoanApprovalWorkflow = async (loanApprovalWorkflow: LoanApprovalWorkflow) => {
    try {
      if (loanApprovalWorkflow.id) {
        const response = await updateLoanApprovalWorkflow({
          route: `/api/financial-products/loan-products/workflows/update/${loanApprovalWorkflow.id}`,
          method: "PUT",
          data: loanApprovalWorkflow,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan approval workflow updated successfully / Flux d'approbation mis à jour avec succès",
            life: 3000,
          });
          loadLoanApprovalWorkflows();
        }
      } else {
        const response = await createLoanApprovalWorkflow({
          route: "/api/financial-products/loan-products/workflows/save",
          method: "POST",
          data: loanApprovalWorkflow,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan approval workflow created successfully / Flux d'approbation créé avec succès",
            life: 3000,
          });
          loadLoanApprovalWorkflows();
        }
      }
      hideDialog();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to save loan approval workflow / Échec de l'enregistrement du flux d'approbation",
        life: 3000,
      });
    }
  };

  const editLoanApprovalWorkflow = (loanApprovalWorkflow: LoanApprovalWorkflow) => {
    setSelectedLoanApprovalWorkflow({ ...loanApprovalWorkflow });
    setDisplayDialog(true);
  };

  const confirmDelete = (loanApprovalWorkflow: LoanApprovalWorkflow) => {
    setSelectedLoanApprovalWorkflow(loanApprovalWorkflow);
    setDeleteDialog(true);
  };

  const deleteLoanApprovalWorkflowAction = async () => {
    if (selectedLoanApprovalWorkflow?.id) {
      try {
        const response = await deleteLoanApprovalWorkflow({
          route: `/api/financial-products/loan-products/workflows/delete/${selectedLoanApprovalWorkflow.id}`,
          method: "DELETE",
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan approval workflow deleted successfully / Flux d'approbation supprimé avec succès",
            life: 3000,
          });
          loadLoanApprovalWorkflows();
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error / Erreur",
          detail: "Failed to delete loan approval workflow / Échec de la suppression du flux d'approbation",
          life: 3000,
        });
      }
      hideDeleteDialog();
    }
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New / Nouveau"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Exporter"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportCSV}
        />
      </div>
    );
  };

  const actionBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanApprovalWorkflow(rowData)}
          tooltip="Edit / Modifier"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete / Supprimer"
        />
      </div>
    );
  };

  const requiredBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    return (
      <Tag
        value={rowData.isRequired ? "Required / Requis" : "Optional / Optionnel"}
        severity={rowData.isRequired ? "warning" : "info"}
      />
    );
  };

  const amountRangeBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    const formatter = new Intl.NumberFormat("fr-BI", {
      style: "currency",
      currency: "BIF",
    });

    if (rowData.minAmount && rowData.maxAmount) {
      return `${formatter.format(rowData.minAmount)} - ${formatter.format(rowData.maxAmount)}`;
    } else if (rowData.minAmount) {
      return `Min: ${formatter.format(rowData.minAmount)}`;
    } else if (rowData.maxAmount) {
      return `Max: ${formatter.format(rowData.maxAmount)}`;
    }
    return "All / Tous";
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Loan Approval Workflows / Gérer les Flux d&apos;Approbation</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Search / Rechercher..."
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
        />
      </span>
    </div>
  );

  const deleteDialogFooter = (
    <>
      <Button
        label="No / Non"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteDialog}
      />
      <Button
        label="Yes / Oui"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteLoanApprovalWorkflowAction}
      />
    </>
  );

  if (!productId) {
    return (
      <div className="card">
        <div className="flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <i className="pi pi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--orange-500)" }} />
            <h3>No Product Selected / Aucun Produit Sélectionné</h3>
            <p>Please select a produit de crédit first / Veuillez d&apos;abord sélectionner un produit de crédit</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />

      <div className="card">
        <TabView>
          <TabPanel header="New / Nouveau">
            <LoanApprovalWorkflowForm
              visible={displayDialog}
              onHide={hideDialog}
              loanApprovalWorkflow={selectedLoanApprovalWorkflow}
              onSave={saveLoanApprovalWorkflow}
              productId={productId}
            />
            <Button
              label="Add Workflow / Ajouter Flux"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={openNew}
            />
          </TabPanel>

          <TabPanel header="All / Tous">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanApprovalWorkflows}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} workflows"
              globalFilter={globalFilter}
              header={header}
              loading={loading}
              emptyMessage="No workflows found / Aucun flux trouvé"
            >
              <Column field="sequenceNumber" header="Sequence / Séquence" sortable />
              <Column
                field="approvalLevel.levelName"
                header="Approval Level / Niveau d'Approbation"
                sortable
              />
              <Column header="Amount Range / Plage de Montant" body={amountRangeBodyTemplate} />
              <Column header="Required / Requis" body={requiredBodyTemplate} sortable />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: "8rem" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanApprovalWorkflowForm
        visible={displayDialog}
        onHide={hideDialog}
        loanApprovalWorkflow={selectedLoanApprovalWorkflow}
        onSave={saveLoanApprovalWorkflow}
        productId={productId}
      />

      <Dialog
        visible={deleteDialog}
        style={{ width: "450px" }}
        header="Confirm / Confirmer"
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          {selectedLoanApprovalWorkflow && (
            <span>
              Êtes-vous sûr de vouloir supprimer this workflow? /
              Êtes-vous sûr de vouloir supprimer ce flux?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default LoanApprovalWorkflowPage;
