import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, User, Mail, Lock, Eye, EyeOff, Loader2, Phone, Calendar, MapPin, Upload, UserCheck, FileText, GraduationCap, Briefcase, IdCard } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            setter(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
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

            await register(formData);
            navigate('/users');
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                        <Pill className="text-white w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mt-4">
                        Add New User
                    </h1>

                    <p className="text-gray-500 mt-2 text-center">
                        Create a new user account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* First Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                First Name
                            </label>

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
                            <label className="text-sm font-medium text-gray-700">
                                Last Name
                            </label>

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
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email
                        </label>

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
                        <label className="text-sm font-medium text-gray-700">
                            Phone Number
                        </label>

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
                        <label className="text-sm font-medium text-gray-700">
                            Role
                        </label>

                        <div className="relative mt-1">
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                required
                            >
                                 <option value="pharmacist">Pharmacist</option>
                                 <option value="cashier">Cashier</option>
                            </select>
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    {/* Gender & Date of Birth Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Gender */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Gender
                            </label>

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
                            <label className="text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>

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
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Address
                        </label>

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
                        <label className="text-sm font-medium text-gray-700">
                            Profile Photo
                        </label>

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
                                        id="profile-photo"
                                    />
                                    <label htmlFor="profile-photo" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Click to upload photo</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pharmacist-Specific Fields (shown when role is pharmacist) */}
                    {form.role === 'pharmacist' && (
                        <div className="border-t border-gray-200 pt-5">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pharmacist Registration Details</h3>

                            {/* License Number & Expiry */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            </div>

                            {/* Professional Registration Number & National ID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            </div>

                            {/* University & Degree */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            </div>

                            {/* Years of Experience & Qualification */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                {/* Upload License Document */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload License Document</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setLicenseDoc)}
                                                className="hidden"
                                                id="license-doc"
                                                required
                                            />
                                            <label htmlFor="license-doc" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">License Document</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Qualification Document */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload Qualification Document</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setQualificationDoc)}
                                                className="hidden"
                                                id="qualification-doc"
                                                required
                                            />
                                            <label htmlFor="qualification-doc" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Qualification Document</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Pharmacy License */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload Pharmacy License</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setPharmacyLicense)}
                                                className="hidden"
                                                id="pharmacy-license"
                                                required
                                            />
                                            <label htmlFor="pharmacy-license" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Pharmacy License</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Degree Certificate */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Upload Degree Certificate</label>
                                    <div className="mt-1">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e, setDegreeCertificate)}
                                                className="hidden"
                                                id="degree-certificate"
                                                required
                                            />
                                            <label htmlFor="degree-certificate" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Degree Certificate</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Password
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
                                required
                                minLength={8}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

                            <input
                                type={showConfirm ? "text" : "password"}
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                className="w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                minLength={8}
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showConfirm ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded"
                            required
                        />

                        <span className="ml-2 text-sm text-gray-600">
                            I agree to the Terms & Conditions
                        </span>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl font-semibold shadow-lg flex justify-center items-center gap-2 disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Create User"
                        )}
                    </button>

                    {/* Back to Users */}
                    <p className="text-center text-sm text-gray-600">
                        <Link
                            to="/users"
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Back to User Management
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}
