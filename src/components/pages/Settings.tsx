import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Key } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, Setting } from "../../types/api";

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<Setting>("/api/settings");
      setSettings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSetting) {
        await apiService.update("/api/settings", editingSetting.id, formData);
      } else {
        await apiService.create("/api/settings", formData);
      }
      fetchSettings();
      resetForm();
    } catch (error) {
      console.error("Failed to save setting:", error);
    }
  };

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting);
    setFormData(setting);
    setModalOpen(true);
  };

  const handleDelete = async (setting: Setting) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      try {
        await apiService.delete("/api/settings", setting.id);
        fetchSettings();
      } catch (error) {
        console.error("Failed to delete setting:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ key: "", value: "", description: "" });
    setEditingSetting(null);
    setModalOpen(false);
  };

  const columns: TableColumn<Setting>[] = [
    {
      key: "key",
      label: "Key",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Key size={14} className="text-slate-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    { key: "value", label: "Value" },
    { key: "description", label: "Description" },
  ];

  const actions: TableAction<Setting>[] = [
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
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage system configuration</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Setting
        </Button>
      </div>

      <DataTable
        data={settings}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search settings..."
        emptyMessage="No settings found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingSetting ? "Edit Setting" : "Add New Setting"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Key"
            value={formData.key}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, key: e.target.value }))
            }
            required
            disabled={!!editingSetting} // عشان الـkey ما يتغيرش بعد الإنشاء
          />
          <Input
            label="Value"
            value={formData.value}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, value: e.target.value }))
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
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSetting ? "Update" : "Create"} Setting
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
