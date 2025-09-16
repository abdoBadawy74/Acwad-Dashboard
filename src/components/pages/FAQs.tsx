import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, FAQ } from "../../types/api";

export const FAQs: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<FAQ>("/api/faqs");
      setFaqs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await apiService.update("/api/faqs", editingFAQ.id, formData);
      } else {
        await apiService.create("/api/faqs", formData);
      }
      fetchFAQs();
      resetForm();
    } catch (error) {
      console.error("Failed to save FAQ:", error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData(faq);
    setModalOpen(true);
  };

  const handleDelete = async (faq: FAQ) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await apiService.delete("/api/faqs", faq.id);
        fetchFAQs();
      } catch (error) {
        console.error("Failed to delete FAQ:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "",
      display_order: 0,
      is_active: true,
    });
    setEditingFAQ(null);
    setModalOpen(false);
  };

  const columns: TableColumn<FAQ>[] = [
    { key: "question", label: "Question", sortable: true },
    { key: "answer", label: "Answer" },
    { key: "category", label: "Category", sortable: true },
    { key: "display_order", label: "Order", sortable: true },
    {
      key: "is_active",
      label: "Status",
      render: (value) =>
        value ? (
          <span className="text-green-600 font-medium">Active</span>
        ) : (
          <span className="text-red-600">Inactive</span>
        ),
    },
  ];

  const actions: TableAction<FAQ>[] = [
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: handleEdit,
      variant: "secondary",
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: "danger",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">FAQs</h1>
          <p className="text-slate-600">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add FAQ
        </Button>
      </div>

      <DataTable
        data={faqs}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search FAQs..."
        emptyMessage="No FAQs found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingFAQ ? "Edit FAQ" : "Add New FAQ"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question"
            value={formData.question}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, question: e.target.value }))
            }
            required
          />
          <TextArea
            label="Answer"
            value={formData.answer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, answer: e.target.value }))
            }
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                display_order: Number(e.target.value),
              }))
            }
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingFAQ ? "Update" : "Create"} FAQ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
