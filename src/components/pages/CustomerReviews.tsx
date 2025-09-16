import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "../DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/Select";
import { apiService } from "../../services/api";
import { TableColumn, TableAction, CustomerReview } from "../../types/api";

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(
    null
  );
  const [formData, setFormData] = useState({
    client_photo: "",
    client_name: "",
    comment: "",
    rating: 0,
    is_featured: false,
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<CustomerReview>(
        "/api/customer-reviews"
      );
      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to fetch customer reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await apiService.update(
          "/api/customer-reviews",
          editingReview.id,
          formData
        );
      } else {
        await apiService.create("/api/customer-reviews", formData);
      }
      fetchReviews();
      resetForm();
    } catch (error) {
      console.error("Failed to save review:", error);
    }
  };

  const handleEdit = (review: CustomerReview) => {
    setEditingReview(review);
    setFormData({
      client_photo: review.client_photo || "",
      client_name: review.client_name || "",
      comment: review.comment || "",
      rating: review.rating || 0,
      is_featured: review.is_featured,
      display_order: review.display_order || 0,
      is_active: review.is_active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (review: CustomerReview) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await apiService.delete("/api/customer-reviews", review.id);
        fetchReviews();
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  };

  const toggleActive = async (review: CustomerReview) => {
    try {
      await apiService.update("/api/customer-reviews", review.id, {
        ...review,
        is_active: !review.is_active,
      });
      fetchReviews();
    } catch (error) {
      console.error("Failed to update review status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_photo: "",
      client_name: "",
      comment: "",
      rating: 0,
      is_featured: false,
      display_order: 0,
      is_active: true,
    });
    setEditingReview(null);
    setModalOpen(false);
  };

  const columns: TableColumn<CustomerReview>[] = [
    {
      key: "client_photo",
      label: "Photo",
      render: (value) =>
        value ? (
          <img src={value} alt="client" className="w-8 h-8 rounded-full" />
        ) : (
          "-"
        ),
    },
    { key: "client_name", label: "Name", sortable: true },
    { key: "comment", label: "Comment" },
    {
      key: "rating",
      label: "Rating",
      render: (value) => "⭐".repeat(value),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value) =>
        value ? (
          <span className="text-green-600">Active</span>
        ) : (
          <span className="text-red-600">Inactive</span>
        ),
    },
  ];

  const actions: TableAction<CustomerReview>[] = [
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
          <h1 className="text-2xl font-semibold text-slate-900">
            Customer Reviews
          </h1>
          <p className="text-slate-600">Manage customer reviews and feedback</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Review
        </Button>
      </div>

      <DataTable
        data={reviews}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search reviews..."
        emptyMessage="No reviews found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingReview ? "Edit Review" : "Add New Review"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Client Name"
            value={formData.client_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, client_name: e.target.value }))
            }
            required
          />

          <Input
            label="Client Photo URL"
            value={formData.client_photo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, client_photo: e.target.value }))
            }
          />

          <TextArea
            label="Comment"
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
          />

          <Input
            label="Rating"
            type="number"
            min={1}
            max={5}
            value={formData.rating}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rating: Number(e.target.value),
              }))
            }
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
              {editingReview ? "Update" : "Create"} Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
