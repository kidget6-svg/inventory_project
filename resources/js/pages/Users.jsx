<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Trash2, Edit, Save, X, Phone, Calendar, MapPin, Upload, UserCheck, FileText, GraduationCap, Briefcase, IdCard, CheckCircle, XCircle } from 'lucide-react';
=======
import React, { useEffect, useState } from "react";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    Plus,
    Search,
    X,
    Save,
    Loader2,
    ShieldCheck,
    Pill,
    WalletCards
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../axios";
import LoadingSpinner from "../components/LoadingSpinner";

>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668

const roleOptions = [
    {
        value: "admin",
        label: "Admin"
    },
    {
        value: "pharmacist",
        label: "Pharmacist"
    },
    {
        value: "cashier",
        label: "Cashier"
    }
];

<<<<<<< HEAD
export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        role: 'cashier',
        gender: '',
        date_of_birth: '',
        address: '',
        license_number: '',
        license_expiry_date: '',
        professional_registration_number: '',
        university: '',
        degree: '',
        years_of_experience: '',
        national_id: '',
        qualification: '',
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [licenseDoc, setLicenseDoc] = useState(null);
    const [qualificationDoc, setQualificationDoc] = useState(null);
    const [pharmacyLicense, setPharmacyLicense] = useState(null);
    const [degreeCertificate, setDegreeCertificate] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
=======


export default function Users(){

    const { user: currentUser } = useAuth();


    const [users,setUsers] = useState([]);

    const [loading,setLoading] = useState(true);

    const [error,setError] = useState("");

    const [search,setSearch] = useState("");

    const [roleFilter,setRoleFilter] = useState("all");


    const [showModal,setShowModal] = useState(false);

    const [editingUser,setEditingUser] = useState(null);


    const [submitting,setSubmitting] = useState(false);



    const [showPassword,setShowPassword] = useState(false);

    const [showConfirm,setShowConfirm] = useState(false);



    const [form,setForm] = useState({

        name:"",
        email:"",
        password:"",
        password_confirmation:"",
        role:"cashier"

    });

>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668




    useEffect(()=>{

        fetchUsers();

    },[]);





    const fetchUsers = async()=>{

        try{

            const response = await api.get("/users");

            setUsers(response.data);

            setError("");

        }

        catch(error){

            console.log(error);

            setError("Failed to load users");

        }

        finally{

            setLoading(false);

        }

    };


<<<<<<< HEAD
    const handleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file);
        }
    };

    const resetForm = () => {
        setForm({ first_name: '', last_name: '', email: '', phone_number: '', password: '', password_confirmation: '', role: 'cashier', gender: '', date_of_birth: '', address: '', license_number: '', license_expiry_date: '', professional_registration_number: '', university: '', degree: '', years_of_experience: '', national_id: '', qualification: '' });
        setProfilePhoto(null);
        setPhotoPreview('');
        setLicenseDoc(null);
        setQualificationDoc(null);
        setPharmacyLicense(null);
        setDegreeCertificate(null);
        setShowPassword(false);
        setShowConfirm(false);
=======




    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    };






    const resetForm=()=>{


        setForm({

            name:"",
            email:"",
            password:"",
            password_confirmation:"",
            role:"cashier"

        });


>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668
        setEditingUser(null);

<<<<<<< HEAD
    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (u) => {
        setForm({
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            email: u.email || '',
            phone_number: u.phone_number || '',
            password: '',
            password_confirmation: '',
            role: u.role || 'cashier',
            gender: u.gender || '',
            date_of_birth: u.date_of_birth || '',
            address: u.address || '',
            license_number: u.license_number || '',
            license_expiry_date: u.license_expiry_date || '',
            professional_registration_number: u.professional_registration_number || '',
            university: u.university || '',
            degree: u.degree || '',
            years_of_experience: u.years_of_experience || '',
            national_id: u.national_id || '',
            qualification: u.qualification || '',
        });
        setProfilePhoto(null);
        setPhotoPreview(u.profile_photo ? u.profile_photo : '');
        setLicenseDoc(null);
        setQualificationDoc(null);
        setPharmacyLicense(null);
        setDegreeCertificate(null);
=======
>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668
        setShowPassword(false);

        setShowConfirm(false);

    };






    const openCreate=()=>{

        resetForm();

        setShowModal(true);

    };






    const openEdit=(user)=>{


        setForm({

            name:user.name,

            email:user.email,

            password:"",

            password_confirmation:"",

            role:user.role

        });


        setEditingUser(user);

        setShowModal(true);


    };







    const closeModal=()=>{

        setShowModal(false);

        resetForm();

    };






    const handleSubmit=async(e)=>{

        e.preventDefault();


        setSubmitting(true);
<<<<<<< HEAD
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
            if (profilePhoto) {
                formData.append('profile_photo', profilePhoto);
            }

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

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData, config);
            } else {
                await api.post('/users', formData, config);
=======



        try{


            if(editingUser){


                await api.put(
                    `/users/${editingUser.id}`,
                    form
                );


>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668
            }

            else{


                await api.post(
                    "/register",
                    form
                );


            }



            await fetchUsers();


            closeModal();


        }


        catch(error){


            const messages =
            error.response?.data?.errors;


            setError(

                messages
                ?
                Object.values(messages)
                .flat()
                .join(" ")
                :
                "Operation failed"

            );


        }


        finally{


            setSubmitting(false);


        }


    };






    const handleDelete=async(id)=>{


        if(!window.confirm("Delete this user?"))
            return;



        try{


            await api.delete(`/users/${id}`);


            fetchUsers();


        }

        catch(error){

            setError("Failed to delete user");

        }


    };

<<<<<<< HEAD
    const handleApprove = async (u) => {
        setActionLoading(u.id);
        try {
            await api.post(`/users/${u.id}/approve`);
            await fetchUsers();
            window.showToast?.('User approved successfully. They can now log in.', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (u) => {
        setActionLoading(u.id);
        try {
            await api.post(`/users/${u.id}/reject`);
            await fetchUsers();
            window.showToast?.('User rejected successfully.', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject user');
        } finally {
            setActionLoading(null);
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-blue-100 text-blue-700',
            pharmacist: 'bg-green-100 text-green-700',
            cashier: 'bg-orange-100 text-orange-600',
=======





    const filteredUsers = users.filter(user=>{


        const matchesSearch =
        user.name
        .toLowerCase()
        .includes(search.toLowerCase())
        ||
        user.email
        .toLowerCase()
        .includes(search.toLowerCase());



        const matchesRole =
        roleFilter==="all"
        ||
        user.role===roleFilter;



        return matchesSearch && matchesRole;


    });





    const totalUsers = users.length;


    const adminCount =
    users.filter(
        user=>user.role==="admin"
    ).length;


    const pharmacistCount =
    users.filter(
        user=>user.role==="pharmacist"
    ).length;


    const cashierCount =
    users.filter(
        user=>user.role==="cashier"
    ).length;





    const getRoleBadge=(role)=>{


        const styles={

            admin:
            "bg-blue-100 text-blue-700",

            pharmacist:
            "bg-green-100 text-green-700",

            cashier:
            "bg-orange-100 text-orange-700"

>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668
        };

<<<<<<< HEAD
    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        const labels = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getUserDisplayName = (u) => {
        if (u.first_name && u.last_name) {
            return `${u.first_name} ${u.last_name}`;
        }
        return u.name || '';
    };

    const getUserInitial = (u) => {
        const name = getUserDisplayName(u);
        return name?.charAt(0) || '';
    };

    if (loading) return <LoadingSpinner text="Loading users..." />;

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    + Add User
                </button>
            </div>

            {/* Add/Edit User Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h3>
                        <button
                            onClick={closeForm}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* First Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">First Name</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={form.phone_number}
                                    onChange={handleChange}
                                    placeholder="(555) 123-4567"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Role</label>
                            <div className="relative mt-1">
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    required
                                >
                                    {roleOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Gender</label>
                            <div className="relative mt-1">
                                <UserCheck className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                            <div className="relative mt-1">
                                <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={form.date_of_birth}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter full address"
                                    rows={3}
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                            <div className="mt-1">
                                {photoPreview ? (
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfilePhoto(null);
                                                setPhotoPreview('');
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setProfilePhoto(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(reader.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="profile-photo-edit"
                                        />
                                        <label htmlFor="profile-photo-edit" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">Click to upload</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pharmacist-Specific Fields (shown when role is pharmacist) */}
                        {form.role === 'pharmacist' && (
                            <>
                                {/* License Number & Expiry */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">License Number</label>
                                    <div className="relative mt-1">
                                        <IdCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="license_number"
                                            value={form.license_number}
                                            onChange={handleChange}
                                            placeholder="Enter license number"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">License Expiry Date</label>
                                    <div className="relative mt-1">
                                        <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            name="license_expiry_date"
                                            value={form.license_expiry_date}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Professional Registration Number & National ID */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Professional Registration Number</label>
                                    <div className="relative mt-1">
                                        <IdCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="professional_registration_number"
                                            value={form.professional_registration_number}
                                            onChange={handleChange}
                                            placeholder="Enter registration number"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">National ID</label>
                                    <div className="relative mt-1">
                                        <IdCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="national_id"
                                            value={form.national_id}
                                            onChange={handleChange}
                                            placeholder="Enter national ID"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* University & Degree */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">University</label>
                                    <div className="relative mt-1">
                                        <GraduationCap className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="university"
                                            value={form.university}
                                            onChange={handleChange}
                                            placeholder="Enter university name"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Degree</label>
                                    <div className="relative mt-1">
                                        <GraduationCap className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="degree"
                                            value={form.degree}
                                            onChange={handleChange}
                                            placeholder="e.g. Pharmacy, B.Pharm"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Years of Experience & Qualification */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                                    <div className="relative mt-1">
                                        <Briefcase className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            name="years_of_experience"
                                            value={form.years_of_experience}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Qualification</label>
                                    <div className="relative mt-1">
                                        <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={form.qualification}
                                            onChange={handleChange}
                                            placeholder="Enter qualification"
                                            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* File Uploads */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload License Document</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setLicenseDoc)}
                                                className="hidden"
                                                id="license-doc-edit"
                                                required
                                            />
                                            <label htmlFor="license-doc-edit" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">License Document</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload Qualification Document</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setQualificationDoc)}
                                                className="hidden"
                                                id="qualification-doc-edit"
                                                required
                                            />
                                            <label htmlFor="qualification-doc-edit" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Qualification Document</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload Pharmacy License</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setPharmacyLicense)}
                                                className="hidden"
                                                id="pharmacy-license-edit"
                                                required
                                            />
                                            <label htmlFor="pharmacy-license-edit" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Pharmacy License</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload Degree Certificate</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setDegreeCertificate)}
                                                className="hidden"
                                                id="degree-certificate-edit"
                                                required
                                            />
                                            <label htmlFor="degree-certificate-edit" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Degree Certificate</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Password {editingUser && '(leave blank to keep current)'}
                            </label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Password (min 8 characters)"
                                    className="w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="password_confirmation"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className="w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-gray-500"
                                >
                                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {editingUser ? 'Saving...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                                        <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                            {getUserInitial(u)}
                                        </div>
                                        <span className="font-medium text-gray-800">{getUserDisplayName(u)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(u.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        {u.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {actionLoading === u.id ? (
                                                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    {actionLoading === u.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => openEditForm(u)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {u.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
=======


        return (

            <span
            className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${styles[role]}
            `}
            >

                {role}

            </span>

        );


    };
// ================= MODAL FORM =================


if(loading){

    return (
        <LoadingSpinner text="Loading users..." />
>>>>>>> b5b4dd71dff8a8a3ca4a27d244782027fdec4668
    );

}



return (

<div className="space-y-6">



{/* ERROR MESSAGE */}

{
error &&

<div className="
bg-red-50
border
border-red-200
text-red-600
p-4
rounded-xl
">

{error}

</div>

}







{/* HEADER */}

<div className="
flex
flex-col
md:flex-row
justify-between
gap-4
items-start
md:items-center
">


<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

User Management

</h1>



<p className="
text-gray-500
mt-1
">

Manage pharmacy staff accounts and permissions

</p>


</div>




<button

onClick={openCreate}

className="
flex
items-center
gap-2
bg-blue-600
hover:bg-blue-700
text-white
px-5
py-3
rounded-xl
shadow
transition
"

>


<Plus size={20}/>

Add User


</button>



</div>









{/* STATISTICS CARDS */}



<div className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-5
">





<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">

<div className="
flex
justify-between
">


<div>

<p className="text-gray-500 text-sm">

Total Users

</p>


<h2 className="
text-3xl
font-bold
text-blue-600
mt-2
">

{totalUsers}

</h2>

</div>


<User
className="
text-blue-500
"
size={35}
/>


</div>

</div>









<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">


<div className="flex justify-between">


<div>

<p className="text-gray-500 text-sm">

Admins

</p>


<h2 className="
text-3xl
font-bold
text-indigo-600
mt-2
">

{adminCount}

</h2>

</div>


<ShieldCheck
className="text-indigo-500"
size={35}
/>


</div>


</div>









<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">


<div className="flex justify-between">


<div>


<p className="text-gray-500 text-sm">

Pharmacists

</p>



<h2 className="
text-3xl
font-bold
text-green-600
mt-2
">

{pharmacistCount}

</h2>


</div>



<Pill
className="text-green-500"
size={35}
/>


</div>


</div>









<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">


<div className="flex justify-between">


<div>

<p className="text-gray-500 text-sm">

Cashiers

</p>


<h2 className="
text-3xl
font-bold
text-orange-600
mt-2
">

{cashierCount}

</h2>


</div>



<WalletCards
className="text-orange-500"
size={35}
/>


</div>


</div>



</div>









{/* SEARCH AND FILTER */}


<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
flex
flex-col
md:flex-row
gap-4
">



<div className="
relative
flex-1
">


<Search

className="
absolute
left-3
top-3
text-gray-400
"

/>



<input


value={search}


onChange={(e)=>setSearch(e.target.value)}


placeholder="Search by name or email..."


className="
w-full
pl-11
py-3
border
rounded-xl
outline-none
focus:ring-2
focus:ring-blue-500
"

/>



</div>






<select


value={roleFilter}


onChange={(e)=>setRoleFilter(e.target.value)}


className="
border
rounded-xl
px-4
py-3
"


>


<option value="all">

All Roles

</option>


<option value="admin">

Admin

</option>


<option value="pharmacist">

Pharmacist

</option>


<option value="cashier">

Cashier

</option>



</select>



</div>









{/* ADD / EDIT MODAL */}



{
showModal &&


<div className="
fixed
inset-0
bg-black
bg-opacity-40
flex
items-center
justify-center
z-50
px-4
">


<div className="
bg-white
rounded-2xl
shadow-xl
w-full
max-w-2xl
p-6
">





<div className="
flex
justify-between
items-center
mb-5
">


<h2 className="
text-xl
font-bold
text-gray-800
">


{
editingUser
?
"Edit User"
:
"Add New User"
}


</h2>



<button

onClick={closeModal}

className="
text-gray-400
hover:text-gray-600
"

>

<X size={22}/>

</button>


</div>








<form

onSubmit={handleSubmit}

className="
grid
grid-cols-1
md:grid-cols-2
gap-5
"

>







<div>

<label className="text-sm font-medium">

Full Name

</label>


<div className="relative mt-1">


<User

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>


<input


name="name"


value={form.name}


onChange={handleChange}


required


className="
w-full
pl-10
py-3
border
rounded-xl
"


placeholder="Full name"

/>



</div>


</div>







<div>

<label className="text-sm font-medium">

Email

</label>



<div className="relative mt-1">


<Mail

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>


<input


type="email"


name="email"


value={form.email}


onChange={handleChange}


required


className="
w-full
pl-10
py-3
border
rounded-xl
"


placeholder="Email"

/>



</div>


</div>








<div>


<label className="text-sm font-medium">

Role

</label>



<select


name="role"


value={form.role}


onChange={handleChange}


className="
w-full
mt-1
py-3
px-4
border
rounded-xl
"


>


{
roleOptions.map(role=>(

<option

key={role.value}

value={role.value}

>

{role.label}

</option>


))

}


</select>


</div>


// ================= PASSWORD FIELDS =================


<div>


<label className="text-sm font-medium">

Password {editingUser && "(leave empty to keep current)"}

</label>


<div className="relative mt-1">


<Lock

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>



<input


type={showPassword ? "text" : "password"}


name="password"


value={form.password}


onChange={handleChange}


minLength={8}


className="
w-full
pl-10
pr-12
py-3
border
rounded-xl
"


placeholder="Password"

/>




<button


type="button"


onClick={()=>setShowPassword(!showPassword)}


className="
absolute
right-3
top-3
text-gray-500
"


>


{
showPassword
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}


</button>



</div>


</div>








<div>


<label className="text-sm font-medium">

Confirm Password

</label>



<div className="relative mt-1">


<Lock

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>




<input


type={showConfirm ? "text" : "password"}


name="password_confirmation"


value={form.password_confirmation}


onChange={handleChange}


className="
w-full
pl-10
pr-12
py-3
border
rounded-xl
"


placeholder="Confirm password"

/>




<button


type="button"


onClick={()=>setShowConfirm(!showConfirm)}


className="
absolute
right-3
top-3
text-gray-500
"


>


{
showConfirm
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}


</button>




</div>



</div>










{/* BUTTONS */}


<div className="
md:col-span-2
flex
justify-end
gap-3
mt-3
">


<button


type="button"


onClick={closeModal}


className="
px-5
py-3
border
rounded-xl
hover:bg-gray-50
"


>


Cancel


</button>





<button


disabled={submitting}


className="
flex
items-center
gap-2
px-5
py-3
bg-blue-600
text-white
rounded-xl
hover:bg-blue-700
disabled:opacity-50
"


>


{
submitting

?

<>

<Loader2
size={18}
className="animate-spin"
/>

Saving...

</>

:

<>

<Save size={18}/>

{
editingUser
?
"Update User"
:
"Create User"
}

</>

}



</button>


</div>




</form>


</div>


</div>


}



{/* USERS TABLE */}



<div className="
bg-white
rounded-xl
shadow-sm
border
overflow-hidden
">


<table className="w-full">


<thead className="bg-gray-50">


<tr>


<th className="px-6 py-4 text-left text-sm">

User

</th>


<th className="px-6 py-4 text-left text-sm">

Email

</th>


<th className="px-6 py-4 text-left text-sm">

Role

</th>


<th className="px-6 py-4 text-left text-sm">

Created

</th>


<th className="px-6 py-4 text-right text-sm">

Actions

</th>


</tr>


</thead>







<tbody className="divide-y">


{

filteredUsers.length > 0

?

filteredUsers.map(user=>(


<tr

key={user.id}

className="
hover:bg-gray-50
transition
"

>


<td className="px-6 py-4">


<div className="
flex
items-center
gap-3
">


<div className="
w-10
h-10
rounded-full
bg-blue-600
text-white
flex
items-center
justify-center
font-bold
">


{
user.name?.charAt(0)
}


</div>



<div>


<p className="font-semibold">

{user.name}

</p>


<p className="text-xs text-gray-400">

ID: {user.id}

</p>


</div>


</div>


</td>







<td className="px-6 py-4 text-gray-600">


{user.email}


</td>







<td className="px-6 py-4">


{getRoleBadge(user.role)}


</td>








<td className="px-6 py-4 text-gray-500">


{
user.created_at
?
new Date(user.created_at)
.toLocaleDateString()
:
"-"
}



</td>








<td className="px-6 py-4">


<div className="
flex
justify-end
gap-2
">



<button


onClick={()=>openEdit(user)}


className="
p-2
text-blue-600
hover:bg-blue-50
rounded-lg
"


title="Edit"


>


<Edit size={18}/>


</button>







{

user.id !== currentUser?.id &&


<button


onClick={()=>handleDelete(user.id)}


className="
p-2
text-red-600
hover:bg-red-50
rounded-lg
"


title="Delete"


>


<Trash2 size={18}/>


</button>


}



</div>


</td>





</tr>


))


:


<tr>


<td


colSpan="5"


className="
text-center
py-10
text-gray-400
"


>


No users found


</td>


</tr>


}


</tbody>


</table>


</div>





</div>


);


}