"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { LoanApprovalWorkflow } from "./LoanApprovalWorkflow";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanApprovalWorkflowFormProps {
  visible: boolean;
  onHide: () => void;
  loanApprovalWorkflow: LoanApprovalWorkflow | null;
  onSave: (loanApprovalWorkflow: LoanApprovalWorkflow) => void;
  productId: number;
}

const LoanApprovalWorkflowForm: React.FC<LoanApprovalWorkflowFormProps> = ({
  visible,
  onHide,
  loanApprovalWorkflow,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<LoanApprovalWorkflow>(new LoanApprovalWorkflow());
  const [submitted, setSubmitted] = useState(false);
  const [approvalLevels, setApprovalLevels] = useState<any[]>([]);

  const { processRequest: loadApprovalLevels } = useConsumApi();

  useEffect(() => {
    if (loanApprovalWorkflow) {
      setFormData({ ...loanApprovalWorkflow });
    } else {
      const newWorkflow = new LoanApprovalWorkflow();
      newWorkflow.productId = productId;
      setFormData(newWorkflow);
    }
    setSubmitted(false);
  }, [loanApprovalWorkflow, visible, productId]);

  useEffect(() => {
    loadApprovalLevelsData();
  }, []);

  const loadApprovalLevelsData = async () => {
    try {
      const response = await loadApprovalLevels({
        route: "/api/financial-products/reference/approval-levels/findall",
        method: "GET",
      });

      if (response?.data) {
        setApprovalLevels(response.data);
      }
    } catch (error) {
      console.error("Error loading approval levels:", error);
    }
  };

  const handleChange = (field: keyof LoanApprovalWorkflow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!formData.approvalLevelId || !formData.sequenceNumber) {
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
        loanApprovalWorkflow?.id
          ? "Edit Loan Approval Workflow / Modifier Flux d'Approbation"
          : "New Loan Approval Workflow / Nouveau Flux d'Approbation"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Workflow Configuration */}
        <Divider>
          <span className="p-tag">Workflow Configuration / Configuration du Flux</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="approvalLevelId" className="col-12 mb-2 md:col-3 md:mb-0">
            Approval Level / Niveau d&apos;Approbation *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="approvalLevelId"
              value={formData.approvalLevelId}
              options={approvalLevels}
              onChange={(e) => handleChange("approvalLevelId", e.value)}
              optionLabel="levelName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.approvalLevelId ? "p-invalid" : ""}
            />
            {submitted && !formData.approvalLevelId && (
              <small className="p-error">
                Approval level is required / Niveau d&apos;approbation requis
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="sequenceNumber" className="col-12 mb-2 md:col-3 md:mb-0">
            Sequence Number / Numéro de Séquence *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="sequenceNumber"
              value={formData.sequenceNumber}
              onValueChange={(e) => handleChange("sequenceNumber", e.value || 1)}
              min={1}
              className={submitted && !formData.sequenceNumber ? "p-invalid" : ""}
            />
            {submitted && !formData.sequenceNumber && (
              <small className="p-error">
                Sequence number is required / Numéro de séquence requis
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

        {/* Section 2: Amount Range */}
        <Divider>
          <span className="p-tag">Amount Range / Plage de Montant</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="minAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Minimum Amount / Montant Minimum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minAmount"
              value={formData.minAmount || 0}
              onValueChange={(e) => handleChange("minAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Maximum Amount / Montant Maximum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxAmount"
              value={formData.maxAmount || 0}
              onValueChange={(e) => handleChange("maxAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanApprovalWorkflowForm;
