import React, { useEffect, useState } from "react";
import {
    Plus,
    ShieldCheck,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Eye,
    Users,
} from "lucide-react";
import api from "../axios";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";

export default function RolesPermissions() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showView, setShowView] = useState(null);

    const [form, setForm] = useState({ name: "", description: "", permissions: [] });

    const loadRoles = async () => {
        setLoading(true);
        try {
            const r = await api.get("/roles");
            setRoles(r.data.roles || []);
            setPermissions(r.data.permissions || []);
            setGroups(r.data.groups || []);
            setError("");
        } catch (e) {
            setError("Failed to load roles & permissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const openCreate = () => {
        setEditingRole(null);
        setForm({ name: "", description: "", permissions: [] });
        setShowModal(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || "",
            permissions: role.permissions || [],
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const togglePermission = (slug) => {
        setForm((prev) => {
            const has = prev.permissions.includes(slug);
            return {
                ...prev,
                permissions: has
                    ? prev.permissions.filter((p) => p !== slug)
                    : [...prev.permissions, slug],
            };
        });
    };

    const toggleGroup = (group, checked) => {
        const groupSlugs = permissions.filter((p) => p.group === group).map((p) => p.slug);
        setForm((prev) => {
            const others = prev.permissions.filter((p) => !groupSlugs.includes(p));
            return {
                ...prev,
                permissions: checked ? [...new Set([...others, ...groupSlugs])] : others,
            };
        });
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            window.showToast("Role name is required", "error");
            return;
        }
        setSubmitting(true);
        try {
            const payload = { ...form, permissions: form.permissions };
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, payload);
                window.showToast("Role updated successfully", "success");
            } else {
                await api.post("/roles", payload);
                window.showToast("Role created successfully", "success");
            }
            setShowModal(false);
            loadRoles();
        } catch (err) {
            window.showToast(err.response?.data?.message || "Failed to save role", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`Delete role "${role.name}"? Users with this role will keep it but lose its permissions.`)) {
            return;
        }
        try {
            await api.delete(`/roles/${role.id}`);
            window.showToast("Role deleted successfully", "success");
            loadRoles();
        } catch (err) {
            window.showToast(err.response?.data?.message || "Failed to delete role", "error");
        }
    };

    const permissionCount = (role) => role.permissions?.length || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner text="Loading roles..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {roles.length} role{roles.length !== 1 ? "s" : ""} · {permissions.length} permissions available
                </p>
                <button onClick={openCreate} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
                    <Plus size={16} /> New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                    role.slug === "admin"
                                        ? "bg-sky-100 text-sky-600"
                                        : role.slug === "pharmacist"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : role.slug === "cashier"
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-violet-100 text-violet-600"
                                }`}>
                                    {role.slug === "admin" ? <ShieldCheck size={22} /> : <Users size={22} />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{role.name}</h3>
                                    <p className="text-xs text-gray-500 capitalize">{role.slug}</p>
                                </div>
                            </div>
                            {role.is_system && (
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                                    System
                                </span>
                            )}
                        </div>

                        <p className="mt-3 text-sm text-gray-500 min-h-[20px]">
                            {role.description || "No description"}
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-semibold">
                                {permissionCount(role)} permissions
                            </span>
                            {role.slug === "admin" && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">
                                    Full access (all permissions)
                                </span>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                            <button
                                onClick={() => setShowView(role)}
                                className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1.5"
                            >
                                <Eye size={15} /> View
                            </button>
                            <button
                                onClick={() => openEdit(role)}
                                className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1.5"
                            >
                                <Pencil size={15} /> Edit
                            </button>
                            {!role.is_system && (
                                <button
                                    onClick={() => handleDelete(role)}
                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    title="Delete role"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editingRole ? `Edit Role: ${editingRole.name}` : "New Role"}
                size="max-w-2xl"
            >
                <div className="p-5 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Inventory Manager"
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="What is this role responsible for?"
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">Permissions</h4>
                            <span className="text-xs text-gray-500">{form.permissions.length} selected</span>
                        </div>

                        {groups.map((group) => {
                            const groupSlugs = permissions.filter((p) => p.group === group).map((p) => p.slug);
                            const selectedCount = groupSlugs.filter((s) => form.permissions.includes(s)).length;
                            const allChecked = selectedCount === groupSlugs.length && groupSlugs.length > 0;
                            const someChecked = selectedCount > 0 && !allChecked;

                            return (
                                <div key={group} className="mb-4 rounded-2xl border border-gray-200 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allChecked}
                                                ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                                onChange={(e) => toggleGroup(group, e.target.checked)}
                                                className="w-4 h-4 rounded accent-sky-600"
                                            />
                                            <span className="text-sm font-semibold text-gray-800">{group}</span>
                                        </label>
                                        <span className="text-xs text-gray-500">{selectedCount}/{groupSlugs.length}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-3">
                                        {permissions
                                            .filter((p) => p.group === group)
                                            .map((p) => (
                                                <label key={p.slug} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sky-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.permissions.includes(p.slug)}
                                                        onChange={() => togglePermission(p.slug)}
                                                        className="w-4 h-4 rounded accent-sky-600"
                                                    />
                                                    <span className="text-sm text-gray-700">{p.name}</span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                    <button
                        onClick={() => setShowModal(false)}
                        className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2"
                    >
                        <X size={15} /> Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {editingRole ? "Save Changes" : "Create Role"}
                    </button>
                </div>
            </Modal>

            <Modal
                open={!!showView}
                onClose={() => setShowView(null)}
                title={showView ? `Permissions: ${showView.name}` : ""}
                size="max-w-xl"
            >
                {showView && (
                    <div className="p-5">
                        <p className="text-sm text-gray-500 mb-4">
                            {showView.description || "No description"} —{" "}
                            {showView.permissions?.length || 0} permissions granted.
                        </p>
                        {showView.slug === "admin" && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4">
                                Admins automatically have every permission in the system.
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {(showView.permissions || []).map((slug) => (
                                <span key={slug} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                                    {slug}
                                </span>
                            ))}
                            {!showView.permissions?.length && showView.slug !== "admin" && (
                                <p className="text-sm text-gray-400">No permissions assigned yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
