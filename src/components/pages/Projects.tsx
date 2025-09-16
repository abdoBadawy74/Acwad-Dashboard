import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Image } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/Select";
import { apiService } from "../../services/api";
import {
  TableColumn,
  TableAction,
  Project,
  ProjectCategory,
} from "../../types/api";

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
    project_category_id: 0,
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<Project>("/api/projects");
      setProjects(response.data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getAll<ProjectCategory>(
        "/api/project-categories"
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await apiService.update("/api/projects", editingProject.id, formData);
      } else {
        await apiService.create("/api/projects", formData);
      }
      fetchProjects();
      resetForm();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setModalOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await apiService.delete("/api/projects", project.id);
        fetchProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      images: [],
      project_category_id: 0,
      is_featured: false,
      is_active: true,
    });
    setEditingProject(null);
    setModalOpen(false);
  };

  const columns: TableColumn<Project>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "description", label: "Description" },
    {
      key: "images",
      label: "Images",
      render: (images) =>
        images && images.length > 0 ? (
          <div className="flex gap-1">
            {images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt="preview"
                className="w-10 h-10 rounded object-cover"
              />
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (value) =>
        value ? (
          <span className="text-blue-600 font-medium">Yes</span>
        ) : (
          <span className="text-gray-500">No</span>
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

  const actions: TableAction<Project>[] = [
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
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-slate-600">Manage portfolio projects</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Project
        </Button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search projects..."
        emptyMessage="No projects found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingProject ? "Edit Project" : "Add New Project"}
        size="lg"
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
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            required
          />
          <TextArea
            label="Images (comma separated URLs)"
            value={formData.images.join(", ")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                images: e.target.value.split(",").map((s) => s.trim()),
              }))
            }
          />
          <Select
            label="Category"
            value={formData.project_category_id.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                project_category_id: Number(e.target.value),
              }))
            }
            options={categories.map((c) => ({
              value: c.id.toString(),
              label: c.name,
            }))}
          />
          <Select
            label="Featured"
            value={formData.is_featured.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_featured: e.target.value === "true",
              }))
            }
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
          />
          <Select
            label="Active"
            value={formData.is_active.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_active: e.target.value === "true",
              }))
            }
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProject ? "Update" : "Create"} Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
