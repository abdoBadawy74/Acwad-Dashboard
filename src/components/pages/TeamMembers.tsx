import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Mail, Linkedin, Github } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, TeamMember } from "../../types/api";

export const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    profile_image: "",
    email: "",
    linkedin: "",
    github: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<TeamMember>("/api/team-members");
      setMembers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await apiService.update("/api/team-members", editingMember.id, formData);
      } else {
        await apiService.create("/api/team-members", formData);
      }
      fetchMembers();
      resetForm();
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData(member);
    setModalOpen(true);
  };

  const handleDelete = async (member: TeamMember) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await apiService.delete("/api/team-members", member.id);
        fetchMembers();
      } catch (error) {
        console.error("Failed to delete member:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      bio: "",
      profile_image: "",
      email: "",
      linkedin: "",
      github: "",
      display_order: 0,
      is_active: true,
    });
    setEditingMember(null);
    setModalOpen(false);
  };

  const columns: TableColumn<TeamMember>[] = [
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
    { key: "email", label: "Email", render: (value) => (
        value ? (
          <a href={`mailto:${value}`} className="text-blue-600 flex items-center gap-1">
            <Mail size={14} /> {value}
          </a>
        ) : "-"
      )
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      render: (value) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1">
            <Linkedin size={14} /> Profile
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "github",
      label: "GitHub",
      render: (value) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-gray-700 flex items-center gap-1">
            <Github size={14} /> Repo
          </a>
        ) : (
          "-"
        ),
    },
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

  const actions: TableAction<TeamMember>[] = [
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
          <h1 className="text-2xl font-semibold text-slate-900">Team Members</h1>
          <p className="text-slate-600">Manage your company team members</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Member
        </Button>
      </div>

      <DataTable
        data={members}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search team members..."
        emptyMessage="No team members found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingMember ? "Edit Member" : "Add New Member"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
            required
          />
          <TextArea
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          />
          <Input
            label="Profile Image URL"
            value={formData.profile_image}
            onChange={(e) => setFormData((prev) => ({ ...prev, profile_image: e.target.value }))}
          />
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="LinkedIn"
            value={formData.linkedin}
            onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
          />
          <Input
            label="GitHub"
            value={formData.github}
            onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))
            }
          />
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingMember ? "Update" : "Create"} Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
