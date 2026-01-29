"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { LoanProductDocument } from "./LoanProductDocument";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanProductDocumentFormProps {
  visible: boolean;
  onHide: () => void;
  loanProductDocument: LoanProductDocument | null;
  onSave: (loanProductDocument: LoanProductDocument) => void;
  productId: number;
}

const LoanProductDocumentForm: React.FC<LoanProductDocumentFormProps> = ({
  visible,
  onHide,
  loanProductDocument,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<LoanProductDocument>(new LoanProductDocument());
  const [submitted, setSubmitted] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  const { processRequest: loadDocumentTypes } = useConsumApi();

  useEffect(() => {
    if (loanProductDocument) {
      setFormData({ ...loanProductDocument });
    } else {
      const newDocument = new LoanProductDocument();
      newDocument.productId = productId;
      setFormData(newDocument);
    }
    setSubmitted(false);
  }, [loanProductDocument, visible, productId]);

  useEffect(() => {
    loadDocumentTypesData();
  }, []);

  const loadDocumentTypesData = async () => {
    try {
      const response = await loadDocumentTypes({
        route: "/api/module-customer-group/kyc-document-types/findall",
        method: "GET",
      });

      if (response?.data) {
        setDocumentTypes(response.data);
      }
    } catch (error) {
      console.error("Error loading document types:", error);
    }
  };

  const handleChange = (field: keyof LoanProductDocument, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!formData.documentTypeId) {
      return;
    }

    onSave(formData);
  };

  const renderDialogFooter = () => {
    return (
      <div>
        <Button
          label="Cancel / Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Save / Enregistrer"
          icon="pi pi-check"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "50vw" }}
      header={
        loanProductDocument?.id
          ? "Edit Loan Product Document / Modifier Document de Produit"
          : "New Loan Product Document / Nouveau Document de Produit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Document Configuration */}
        <Divider>
          <span className="p-tag">Document Configuration / Configuration du Document</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="documentTypeId" className="col-12 mb-2 md:col-3 md:mb-0">
            Document Type / Type de Document *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="documentTypeId"
              value={formData.documentTypeId}
              options={documentTypes}
              onChange={(e) => handleChange("documentTypeId", e.value)}
              optionLabel="typeName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.documentTypeId ? "p-invalid" : ""}
            />
            {submitted && !formData.documentTypeId && (
              <small className="p-error">
                Document type is required / Type de document requis
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Is Required / Est Requis
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="isRequired"
              checked={formData.isRequired}
              onChange={(e) => handleChange("isRequired", e.checked)}
            />
          </div>
        </div>

        {/* Section 2: Description */}
        <Divider>
          <span className="p-tag">Description</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="description" className="col-12 mb-2 md:col-3 md:mb-0">
            Description (EN)
          </label>
          <div className="col-12 md:col-9">
            <InputTextarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="descriptionFr" className="col-12 mb-2 md:col-3 md:mb-0">
            Description (FR)
          </label>
          <div className="col-12 md:col-9">
            <InputTextarea
              id="descriptionFr"
              value={formData.descriptionFr || ""}
              onChange={(e) => handleChange("descriptionFr", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanProductDocumentForm;
