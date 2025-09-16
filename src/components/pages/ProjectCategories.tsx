import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, ProjectCategory } from "../../types/api";

export const ProjectCategories: React.FC = () => {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ProjectCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<ProjectCategory>(
        "/api/project-categories"
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch project categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiService.update(
          "/api/project-categories",
          editingCategory.id,
          formData
        );
      } else {
        await apiService.create("/api/project-categories", formData);
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Failed to save project category:", error);
    }
  };

  const handleEdit = (category: ProjectCategory) => {
    setEditingCategory(category);
    setFormData(category);
    setModalOpen(true);
  };

  const handleDelete = async (category: ProjectCategory) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await apiService.delete("/api/project-categories", category.id);
        fetchCategories();
      } catch (error) {
        console.error("Failed to delete project category:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
    setModalOpen(false);
  };

  const columns: TableColumn<ProjectCategory>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
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

  const actions: TableAction<ProjectCategory>[] = [
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
            Project Categories
          </h1>
          <p className="text-slate-600">Manage categories for projects</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search categories..."
        emptyMessage="No categories found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={
          editingCategory ? "Edit Project Category" : "Add New Project Category"
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
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
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
