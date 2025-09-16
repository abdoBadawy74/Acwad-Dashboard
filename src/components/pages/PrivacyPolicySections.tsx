import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { apiService } from "../../services/api";
import {
  TableColumn,
  TableAction,
  PrivacyPolicySection,
} from "../../types/api";

export const PrivacyPolicySections: React.FC = () => {
  const [sections, setSections] = useState<PrivacyPolicySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<PrivacyPolicySection | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<PrivacyPolicySection>(
        "/api/privacy-policy-sections"
      );
      setSections(response.data || []);
    } catch (error) {
      console.error("Failed to fetch privacy policy sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await apiService.update(
          "/api/privacy-policy-sections",
          editingSection.id,
          formData
        );
      } else {
        await apiService.create("/api/privacy-policy-sections", formData);
      }
      fetchSections();
      resetForm();
    } catch (error) {
      console.error("Failed to save privacy policy section:", error);
    }
  };

  const handleEdit = (section: PrivacyPolicySection) => {
    setEditingSection(section);
    setFormData(section);
    setModalOpen(true);
  };

  const handleDelete = async (section: PrivacyPolicySection) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await apiService.delete("/api/privacy-policy-sections", section.id);
        fetchSections();
      } catch (error) {
        console.error("Failed to delete section:", error);
      }
    }
  };

  const handleReorder = async () => {
    try {
      await apiService.update("/api/privacy-policy-sections/reorder", null, {
        sections: sections.map((s, idx) => ({
          id: s.id,
          display_order: idx + 1,
        })),
      });
      fetchSections();
    } catch (error) {
      console.error("Failed to reorder sections:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      display_order: 0,
      is_active: true,
    });
    setEditingSection(null);
    setModalOpen(false);
  };

  const columns: TableColumn<PrivacyPolicySection>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "content", label: "Content" },
    {
      key: "display_order",
      label: "Order",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <GripVertical size={14} className="text-slate-400" />
          <span>{value}</span>
        </div>
      ),
    },
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

  const actions: TableAction<PrivacyPolicySection>[] = [
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
          <h1 className="text-2xl font-semibold text-slate-900">
            Privacy Policy Sections
          </h1>
          <p className="text-slate-600">
            Manage privacy policy sections and ordering
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Section
          </Button>
          <Button variant="secondary" onClick={handleReorder}>
            Save Order
          </Button>
        </div>
      </div>

      <DataTable
        data={sections}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search sections..."
        emptyMessage="No sections found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={
          editingSection
            ? "Edit Privacy Policy Section"
            : "Add New Privacy Policy Section"
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
          <TextArea
            label="Content"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
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
              {editingSection ? "Update" : "Create"} Section
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
