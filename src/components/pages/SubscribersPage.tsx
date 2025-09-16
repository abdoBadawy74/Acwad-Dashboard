import React, { useState, useEffect } from 'react';
import { Plus, Mail, Phone, Building, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '../DataTable';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { apiService } from '../../services/api';
import { Subscriber, TableColumn, TableAction } from '../../types/api';

export const SubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    subscribed: true
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAll<Subscriber>('/api/subscribers');
      setSubscribers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubscriber) {
        await apiService.update('/api/subscribers', editingSubscriber.id, formData);
      } else {
        await apiService.create('/api/subscribers', formData);
      }
      fetchSubscribers();
      resetForm();
    } catch (error) {
      console.error('Failed to save subscriber:', error);
    }
  };

  const handleEdit = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setFormData({
      name: subscriber.name,
      email: subscriber.email,
      phone: subscriber.phone || '',
      company: subscriber.company || '',
      message: subscriber.message || '',
      subscribed: subscriber.subscribed
    });
    setModalOpen(true);
  };

  const handleDelete = async (subscriber: Subscriber) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      try {
        await apiService.delete('/api/subscribers', subscriber.id);
        fetchSubscribers();
      } catch (error) {
        console.error('Failed to delete subscriber:', error);
      }
    }
  };

  const toggleSubscription = async (subscriber: Subscriber) => {
    try {
      await apiService.updateSubscriptionStatus(subscriber.id, !subscriber.subscribed);
      fetchSubscribers();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      subscribed: true
    });
    setEditingSubscriber(null);
    setModalOpen(false);
  };

  const columns: TableColumn<Subscriber>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-xs">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400" />
          <span>{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'company',
      label: 'Company',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-slate-400" />
          <span>{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'subscribed',
      label: 'Status',
      render: (value) => (
        <span className={`
          inline-flex px-2 py-1 text-xs font-semibold rounded-full
          ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
          {value ? 'Subscribed' : 'Unsubscribed'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions: TableAction<Subscriber>[] = [
    {
      label: 'Edit',
      icon: <Edit size={14} />,
      onClick: handleEdit,
      variant: 'secondary'
    },
    {
      label: 'Toggle Subscription',
      onClick: toggleSubscription,
      variant: 'primary'
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: handleDelete,
      variant: 'danger'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Subscribers</h1>
          <p className="text-slate-600">Manage newsletter subscribers and their preferences</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Subscriber
        </Button>
      </div>

      <DataTable
        data={subscribers}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        searchPlaceholder="Search subscribers..."
        emptyMessage="No subscribers found"
      />

      <Modal
        isOpen={modalOpen}
        onClose={resetForm}
        title={editingSubscriber ? 'Edit Subscriber' : 'Add New Subscriber'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          />
          
          <TextArea
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          />
          
          <Select
            label="Subscription Status"
            value={formData.subscribed.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, subscribed: e.target.value === 'true' }))}
            options={[
              { value: 'true', label: 'Subscribed' },
              { value: 'false', label: 'Unsubscribed' }
            ]}
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSubscriber ? 'Update' : 'Create'} Subscriber
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};