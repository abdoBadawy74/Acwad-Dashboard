import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, Leadership } from "../../types/api";

export const Leaderships: React.FC = () => {
  const [leaders, setLeaders] = useState<Leadership[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leadership | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    profile_image: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<Leadership>("/api/leadership");
      setLeaders(response.data || []);
    } catch (error) {
      console.error("Failed to fetch leadership members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLeader) {
        await apiService.update("/api/leadership", editingLeader.id, formData);
      } else {
        await apiService.create("/api/leadership", formData);
      }
      fetchLeaders();
      resetForm();
    } catch (error) {
      console.error("Failed to save leadership member:", error);
    }
  };

  const handleEdit = (leader: Leadership) => {
    setEditingLeader(leader);
    setFormData(leader);
    setModalOpen(true);
  };

  const handleDelete = async (leader: Leadership) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await apiService.delete("/api/leadership", leader.id);
        fetchLeaders();
      } catch (error) {
        console.error("Failed to delete leadership member:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      bio: "",
      profile_image: "",
      display_order: 0,
      is_active: true,
    });
    setEditingLeader(null);
    setModalOpen(false);
  };

  const columns: TableColumn<Leadership>[] = [
    {
      key: "profile_image",
      label: "Photo",
      render: (value) =>
        value ? (
          <img
            src={value}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        ),
    },
    { key: "name", label: "Name", sortable: true },
    { key: "position", label: "Position" },
    { key: "bio", label: "Bio" },
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

  const actions: TableAction<Leadership>[] = [
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
          <h1 className="text-2xl font-semibold text-slate-900">Leadership</h1>
          <p className="text-slate-600">Manage leadership team members</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Member
        </Button>
      </div>

      <DataTable
        data={leaders}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search leadership..."
        emptyMessage="No leadership members found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={
          editingLeader ? "Edit Leadership Member" : "Add New Leadership Member"
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
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, position: e.target.value }))
            }
            required
          />
          <TextArea
            label="Bio"
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
          />
          <Input
            label="Profile Image URL"
            value={formData.profile_image}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile_image: e.target.value,
              }))
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
              {editingLeader ? "Update" : "Create"} Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
