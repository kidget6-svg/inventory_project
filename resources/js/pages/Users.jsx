import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../axios';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Trash2, Edit, Save, X, Phone, Calendar, MapPin, Upload, UserCheck, FileText, GraduationCap, Briefcase, IdCard, CheckCircle, XCircle } from 'lucide-react';

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'cashier', label: 'Cashier' },
];

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone_number: '',
        password: '', password_confirmation: '', role: 'cashier', gender: '',
        date_of_birth: '', address: '', license_number: '', license_expiry_date: '',
        professional_registration_number: '', university: '', degree: '',
        years_of_experience: '', national_id: '', qualification: '',
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [licenseDoc, setLicenseDoc] = useState(null);
    const [qualificationDoc, setQualificationDoc] = useState(null);
    const [pharmacyLicense, setPharmacyLicense] = useState(null);
    const [degreeCertificate, setDegreeCertificate] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try { const res = await api.get('/users'); setUsers(res.data); setError(''); }
        catch (err) { setError('Failed to load users'); console.error(err); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFileChange = (e, setter) => { const file = e.target.files[0]; if (file) setter(file); };

    const resetForm = () => {
        setForm({ first_name: '', last_name: '', email: '', phone_number: '', password: '', password_confirmation: '', role: 'cashier', gender: '', date_of_birth: '', address: '', license_number: '', license_expiry_date: '', professional_registration_number: '', university: '', degree: '', years_of_experience: '', national_id: '', qualification: '' });
        setProfilePhoto(null); setPhotoPreview(''); setLicenseDoc(null); setQualificationDoc(null);
        setPharmacyLicense(null); setDegreeCertificate(null); setShowPassword(false); setShowConfirm(false);
        setEditingUser(null); setError('');
    };

    const openCreateForm = () => { resetForm(); setShowModal(true); };

    const openEditForm = (u) => {
        setForm({
            first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '',
            phone_number: u.phone_number || '', password: '', password_confirmation: '',
            role: u.role || 'cashier', gender: u.gender || '', date_of_birth: u.date_of_birth || '',
            address: u.address || '', license_number: u.license_number || '', license_expiry_date: u.license_expiry_date || '',
            professional_registration_number: u.professional_registration_number || '', university: u.university || '',
            degree: u.degree || '', years_of_experience: u.years_of_experience || '',
            national_id: u.national_id || '', qualification: u.qualification || '',
        });
        setProfilePhoto(null); setPhotoPreview(u.profile_photo ? u.profile_photo : '');
        setLicenseDoc(null); setQualificationDoc(null); setPharmacyLicense(null); setDegreeCertificate(null);
        setShowPassword(false); setShowConfirm(false);
        setEditingUser(u);
        setShowModal(true);
    };

    const closeForm = () => { setShowModal(false); resetForm(); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('first_name', form.first_name);
            formData.append('last_name', form.last_name);
            formData.append('email', form.email);
            formData.append('phone_number', form.phone_number);
            formData.append('password', form.password);
            formData.append('password_confirmation', form.password_confirmation);
            formData.append('role', form.role);
            formData.append('gender', form.gender);
            formData.append('date_of_birth', form.date_of_birth);
            formData.append('address', form.address);
            if (profilePhoto) formData.append('profile_photo', profilePhoto);

            if (form.role === 'pharmacist') {
                formData.append('license_number', form.license_number);
                formData.append('license_expiry_date', form.license_expiry_date);
                formData.append('professional_registration_number', form.professional_registration_number);
                formData.append('university', form.university);
                formData.append('degree', form.degree);
                formData.append('years_of_experience', form.years_of_experience);
                formData.append('national_id', form.national_id);
                formData.append('qualification', form.qualification);
                if (licenseDoc) formData.append('license_document', licenseDoc);
                if (qualificationDoc) formData.append('qualification_document', qualificationDoc);
                if (pharmacyLicense) formData.append('pharmacy_license', pharmacyLicense);
                if (degreeCertificate) formData.append('degree_certificate', degreeCertificate);
            }

            const config = { headers: { 'Content-Type': undefined } };
            if (editingUser) await api.put(`/users/${editingUser.id}`, formData, config);
            else await api.post('/users', formData, config);
            await fetchUsers();
            closeForm();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Operation failed');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try { await api.delete(`/users/${id}`); await fetchUsers(); }
        catch (err) { setError(err.response?.data?.message || 'Failed to delete user'); }
    };

    const handleApprove = async (u) => {
        setActionLoading(u.id);
        try { await api.post(`/users/${u.id}/approve`); await fetchUsers(); window.showToast?.('User approved successfully. They can now log in.', 'success'); }
        catch (err) { setError(err.response?.data?.message || 'Failed to approve user'); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (u) => {
        setActionLoading(u.id);
        try { await api.post(`/users/${u.id}/reject`); await fetchUsers(); window.showToast?.('User rejected successfully.', 'success'); }
        catch (err) { setError(err.response?.data?.message || 'Failed to reject user'); }
        finally { setActionLoading(null); }
    };

    const getRoleBadge = (role) => {
        const colors = { admin: 'bg-sky-100 text-sky-700', pharmacist: 'bg-green-100 text-green-700', cashier: 'bg-orange-100 text-orange-600' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-600'}`}>{role}</span>;
    };

    const getStatusBadge = (status) => {
        const colors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
        const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{labels[status] || status}</span>;
    };

    const getUserDisplayName = (u) => { if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`; return u.name || ''; };
    const getUserInitial = (u) => { const name = getUserDisplayName(u); return name?.charAt(0) || ''; };

    if (loading) return <LoadingSpinner text="Loading users..." />;

    return (
        <div className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <button onClick={openCreateForm} className="btn-primary px-4 py-2 flex items-center gap-2">+ Add User</button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.length > 0 ? users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">{getUserInitial(u)}</div>
                                        <span className="font-medium text-gray-800">{getUserDisplayName(u)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(u.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        {u.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(u)} disabled={actionLoading === u.id} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50" title="Approve">
                                                    {actionLoading === u.id ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                                                </button>
                                                <button onClick={() => handleReject(u)} disabled={actionLoading === u.id} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="Reject">
                                                    {actionLoading === u.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <XCircle size={16} />}
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => openEditForm(u)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                                        {u.id !== currentUser?.id && (
                                            <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={showModal} onClose={closeForm} title={editingUser ? 'Edit User' : 'Add New User'} size="max-w-4xl">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Enter first name" className="input-field pl-11" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Enter last name" className="input-field pl-11" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className="input-field pl-11" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative mt-1">
                            <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="(555) 123-4567" className="input-field pl-11" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <div className="relative mt-1">
                            <select name="role" value={form.role} onChange={handleChange} className="input-field pl-11 appearance-none" required>
                                {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Gender</label>
                        <div className="relative mt-1">
                            <UserCheck className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <select name="gender" value={form.gender} onChange={handleChange} className="input-field pl-11 appearance-none">
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                        <div className="relative mt-1">
                            <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="input-field pl-11" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <div className="relative mt-1">
                            <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Enter full address" rows={3} className="input-field pl-11 resize-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                        <div className="mt-1">
                            {photoPreview ? (
                                <div className="flex items-center gap-4">
                                    <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                                    <button type="button" onClick={() => { setProfilePhoto(null); setPhotoPreview(''); }} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500 transition-colors">
                                    <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setProfilePhoto(file); const reader = new FileReader(); reader.onloadend = () => setPhotoPreview(reader.result); reader.readAsDataURL(file); } }} className="hidden" id="profile-photo-modal" />
                                    <label htmlFor="profile-photo-modal" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Click to upload</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {form.role === 'pharmacist' && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700">License Number</label>
                                <div className="relative mt-1">
                                    <IdCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" name="license_number" value={form.license_number} onChange={handleChange} placeholder="Enter license number" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">License Expiry Date</label>
                                <div className="relative mt-1">
                                    <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="date" name="license_expiry_date" value={form.license_expiry_date} onChange={handleChange} className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Professional Registration Number</label>
                                <div className="relative mt-1">
                                    <IdCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" name="professional_registration_number" value={form.professional_registration_number} onChange={handleChange} placeholder="Enter registration number" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">National ID</label>
                                <div className="relative mt-1">
                                    <IdCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" name="national_id" value={form.national_id} onChange={handleChange} placeholder="Enter national ID" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">University</label>
                                <div className="relative mt-1">
                                    <GraduationCap className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" name="university" value={form.university} onChange={handleChange} placeholder="Enter university name" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Degree</label>
                                <div className="relative mt-1">
                                    <GraduationCap className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. Pharmacy, B.Pharm" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                                <div className="relative mt-1">
                                    <Briefcase className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} placeholder="0" min="0" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Qualification</label>
                                <div className="relative mt-1">
                                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input type="text" name="qualification" value={form.qualification} onChange={handleChange} placeholder="Enter qualification" className="input-field pl-11" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Upload License Document</label>
                                <div className="mt-1">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500 transition-colors">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setLicenseDoc)} className="hidden" id="license-doc-modal" required />
                                        <label htmlFor="license-doc-modal" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">License Document</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Upload Qualification Document</label>
                                <div className="mt-1">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500 transition-colors">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setQualificationDoc)} className="hidden" id="qualification-doc-modal" required />
                                        <label htmlFor="qualification-doc-modal" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">Qualification Document</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Upload Pharmacy License</label>
                                <div className="mt-1">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500 transition-colors">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setPharmacyLicense)} className="hidden" id="pharmacy-license-modal" required />
                                        <label htmlFor="pharmacy-license-modal" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">Pharmacy License</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Upload Degree Certificate</label>
                                <div className="mt-1">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500 transition-colors">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setDegreeCertificate)} className="hidden" id="degree-certificate-modal" required />
                                        <label htmlFor="degree-certificate-modal" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">Degree Certificate</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-700">Password {editingUser && '(leave blank to keep current)'}</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Password (min 8 characters)" className="input-field pl-11 pr-12" minLength={8} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input type={showConfirm ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} placeholder="Confirm Password" className="input-field pl-11 pr-12" minLength={8} />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-500">{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                            {submitting ? <><Loader2 size={18} className="animate-spin" />{editingUser ? 'Saving...' : 'Creating...'}</>
                                : <><Save size={18} />{editingUser ? 'Update User' : 'Create User'}</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
