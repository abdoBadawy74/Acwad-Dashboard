import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/Select";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, Service } from "../../types/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    icon: "",
    title: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<Service>("/api/services");
      setServices(response.data || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await apiService.update("/api/services", editingService.id, formData);
      } else {
        await apiService.create("/api/services", formData);
      }
      fetchServices();
      resetForm();
    } catch (error) {
      console.error("Failed to save service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      icon: service.icon,
      title: service.title,
      description: service.description,
      display_order: service.display_order,
      is_active: service.is_active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await apiService.delete("/api/services", service.id);
        fetchServices();
      } catch (error) {
        console.error("Failed to delete service:", error);
      }
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      await apiService.update("/api/services", service.id, {
        ...service,
        is_active: !service.is_active,
      });
      fetchServices();
    } catch (error) {
      console.error("Failed to update service status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      icon: "",
      title: "",
      description: "",
      display_order: 0,
      is_active: true,
    });
    setEditingService(null);
    setModalOpen(false);
  };

  const columns: TableColumn<Service>[] = [
  {
    key: "icon",
    label: "Icon",
    render: (value) => (
      <div className="flex items-center justify-center text-slate-700">
        <FontAwesomeIcon icon={value as any} size="lg" />
      </div>
    ),
  },
  { key: "title", label: "Title", sortable: true },
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

  const actions: TableAction<Service>[] = [
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: handleEdit,
      variant: "secondary",
    },
    {
      label: "Toggle Active",
      onClick: toggleActive,
      variant: "primary",
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
          <h1 className="text-2xl font-semibold text-slate-900">Services</h1>
          <p className="text-slate-600">Manage your services</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Service
        </Button>
      </div>

      <DataTable
        data={services}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search services..."
        emptyMessage="No services found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingService ? "Edit Service" : "Add New Service"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Icon (CSS class)"
            value={formData.icon}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, icon: e.target.value }))
            }
          />

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
              {editingService ? "Update" : "Create"} Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
