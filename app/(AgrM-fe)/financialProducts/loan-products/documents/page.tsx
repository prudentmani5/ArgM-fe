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
import { LoanProductDocument } from "./LoanProductDocument";
import LoanProductDocumentForm from "./LoanProductDocumentForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { useSearchParams } from "next/navigation";

const LoanProductDocumentPage = () => {
  const [loanProductDocuments, setLoanProductDocuments] = useState<LoanProductDocument[]>([]);
  const [selectedLoanProductDocument, setSelectedLoanProductDocument] = useState<LoanProductDocument | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanProductDocument[]>>(null);
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("productId") || "0");

  const { processRequest: fetchLoanProductDocuments } = useConsumApi();
  const { processRequest: createLoanProductDocument } = useConsumApi();
  const { processRequest: updateLoanProductDocument } = useConsumApi();
  const { processRequest: deleteLoanProductDocument } = useConsumApi();

  useEffect(() => {
    if (productId) {
      loadLoanProductDocuments();
    }
  }, [productId]);

  const loadLoanProductDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetchLoanProductDocuments({
        route: `/api/financial-products/loan-products/documents/product/${productId}`,
        method: "GET",
      });

      if (response?.data) {
        setLoanProductDocuments(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to load produit de crédit documents / Échec du chargement des documents",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setSelectedLoanProductDocument(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanProductDocument(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanProductDocument(null);
  };

  const saveLoanProductDocument = async (loanProductDocument: LoanProductDocument) => {
    try {
      if (loanProductDocument.id) {
        const response = await updateLoanProductDocument({
          route: `/api/financial-products/loan-products/documents/update/${loanProductDocument.id}`,
          method: "PUT",
          data: loanProductDocument,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product document updated successfully / Document mis à jour avec succès",
            life: 3000,
          });
          loadLoanProductDocuments();
        }
      } else {
        const response = await createLoanProductDocument({
          route: "/api/financial-products/loan-products/documents/save",
          method: "POST",
          data: loanProductDocument,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product document created successfully / Document créé avec succès",
            life: 3000,
          });
          loadLoanProductDocuments();
        }
      }
      hideDialog();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to save produit de crédit document / Échec de l'enregistrement du document",
        life: 3000,
      });
    }
  };

  const editLoanProductDocument = (loanProductDocument: LoanProductDocument) => {
    setSelectedLoanProductDocument({ ...loanProductDocument });
    setDisplayDialog(true);
  };

  const confirmDelete = (loanProductDocument: LoanProductDocument) => {
    setSelectedLoanProductDocument(loanProductDocument);
    setDeleteDialog(true);
  };

  const deleteLoanProductDocumentAction = async () => {
    if (selectedLoanProductDocument?.id) {
      try {
        const response = await deleteLoanProductDocument({
          route: `/api/financial-products/loan-products/documents/delete/${selectedLoanProductDocument.id}`,
          method: "DELETE",
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product document deleted successfully / Document supprimé avec succès",
            life: 3000,
          });
          loadLoanProductDocuments();
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error / Erreur",
          detail: "Failed to delete produit de crédit document / Échec de la suppression du document",
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

  const actionBodyTemplate = (rowData: LoanProductDocument) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanProductDocument(rowData)}
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

  const requiredBodyTemplate = (rowData: LoanProductDocument) => {
    return (
      <Tag
        value={rowData.isRequired ? "Required / Requis" : "Optional / Optionnel"}
        severity={rowData.isRequired ? "warning" : "info"}
      />
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Loan Product Documents / Gérer les Documents de Produit</h4>
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
        onClick={deleteLoanProductDocumentAction}
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
            <LoanProductDocumentForm
              visible={displayDialog}
              onHide={hideDialog}
              loanProductDocument={selectedLoanProductDocument}
              onSave={saveLoanProductDocument}
              productId={productId}
            />
            <Button
              label="Add Document / Ajouter Document"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={openNew}
            />
          </TabPanel>

          <TabPanel header="All / Tous">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanProductDocuments}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} documents"
              globalFilter={globalFilter}
              header={header}
              loading={loading}
              emptyMessage="No documents found / Aucun document trouvé"
            >
              <Column
                field="documentType.typeName"
                header="Document Type / Type de Document"
                sortable
              />
              <Column
                field="documentType.typeCode"
                header="Document Code / Code Document"
                sortable
              />
              <Column header="Required / Requis" body={requiredBodyTemplate} sortable />
              <Column field="description" header="Description" sortable />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: "8rem" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanProductDocumentForm
        visible={displayDialog}
        onHide={hideDialog}
        loanProductDocument={selectedLoanProductDocument}
        onSave={saveLoanProductDocument}
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
          {selectedLoanProductDocument && (
            <span>
              Êtes-vous sûr de vouloir supprimer this document? /
              Êtes-vous sûr de vouloir supprimer ce document?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default LoanProductDocumentPage;
