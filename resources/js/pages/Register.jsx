import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stepper from '../components/Stepper';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Phone, Calendar, MapPin, Upload, UserCheck, FileText, GraduationCap, Briefcase, IdCard, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isPharmacist = form.role === 'pharmacist';
    const formSteps = isPharmacist
        ? ['Personal Info', 'Pharmacist Details', 'Account Setup']
        : ['Personal Info', 'Account Setup'];

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) setter(file);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, formSteps.length - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

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
            if (profilePhoto) formData.append('profile_photo', profilePhoto);

            if (isPharmacist) {
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

    const renderPersonalInfo = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Enter first name" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Enter last name" className="input-field pl-11" required />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className="input-field pl-11" required />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="(555) 123-4567" className="input-field pl-11" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-gray-400 z-10" size={18} />
                    <select name="role" value={form.role} onChange={(e) => { handleChange(e); setStep(0); }} className="select-field pl-11" required>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="cashier">Cashier</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                    <div className="relative">
                        <UserCheck className="absolute left-3.5 top-3.5 text-gray-400 z-10" size={18} />
                        <select name="gender" value={form.gender} onChange={handleChange} className="select-field pl-11">
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="input-field pl-11" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <textarea name="address" value={form.address} onChange={handleChange} placeholder="Enter full address" rows={2} className="input-field pl-11 resize-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Photo</label>
                {photoPreview ? (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
                        <button type="button" onClick={() => { setProfilePhoto(null); setPhotoPreview(''); }} className="text-sm text-red-600 hover:text-red-700 font-medium">Remove</button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition-all">
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { setProfilePhoto(file); const reader = new FileReader(); reader.onloadend = () => setPhotoPreview(reader.result); reader.readAsDataURL(file); }
                        }} className="hidden" id="profile-photo" />
                        <label htmlFor="profile-photo" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500 font-medium">Click to upload photo</span>
                        </label>
                    </div>
                )}
            </div>
        </>
    );

    const renderPharmacistDetails = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                    <div className="relative">
                        <IdCard className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="license_number" value={form.license_number} onChange={handleChange} placeholder="Enter license number" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">License Expiry Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="date" name="license_expiry_date" value={form.license_expiry_date} onChange={handleChange} className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Registration</label>
                    <div className="relative">
                        <IdCard className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="professional_registration_number" value={form.professional_registration_number} onChange={handleChange} placeholder="Registration number" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">National ID</label>
                    <div className="relative">
                        <IdCard className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="national_id" value={form.national_id} onChange={handleChange} placeholder="Enter national ID" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">University</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="university" value={form.university} onChange={handleChange} placeholder="University name" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Degree</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. Pharmacy, B.Pharm" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} placeholder="0" min="0" className="input-field pl-11" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Qualification</label>
                    <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type="text" name="qualification" value={form.qualification} onChange={handleChange} placeholder="Enter qualification" className="input-field pl-11" required />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">License Document</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition-all">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setLicenseDoc)} className="hidden" id="license-doc" required />
                        <label htmlFor="license-doc" className="cursor-pointer flex flex-col items-center gap-1.5">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">Upload License</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Qualification Document</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition-all">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setQualificationDoc)} className="hidden" id="qualification-doc" required />
                        <label htmlFor="qualification-doc" className="cursor-pointer flex flex-col items-center gap-1.5">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">Upload Qualification</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Pharmacy License</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition-all">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setPharmacyLicense)} className="hidden" id="pharmacy-license" required />
                        <label htmlFor="pharmacy-license" className="cursor-pointer flex flex-col items-center gap-1.5">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">Pharmacy License</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Degree Certificate</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition-all">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setDegreeCertificate)} className="hidden" id="degree-certificate" required />
                        <label htmlFor="degree-certificate" className="cursor-pointer flex flex-col items-center gap-1.5">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">Degree Certificate</span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );

    const renderAccountSetup = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" className="input-field pl-11 pr-11" required minLength={8} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <input type={showConfirm ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} placeholder="Confirm password" className="input-field pl-11 pr-11" required minLength={8} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600">
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500" required />
                <span className="text-sm text-gray-600">I agree to the Terms & Conditions</span>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 mb-4 transition-colors">
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                        <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4 shadow-2xl ring-2 ring-sky-400/70">
                            <img src="/images/p1.png" alt="EthioPharmacy" className="w-16 h-16 object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-1.5 text-sm">Register as a pharmacist or cashier</p>
                    </div>

                    <Stepper steps={formSteps} currentStep={step} />

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 0 && renderPersonalInfo()}
                        {isPharmacist && step === 1 && renderPharmacistDetails()}
                        {step === formSteps.length - 1 && renderAccountSetup()}

                        <div className="flex items-center justify-between pt-2">
                            {step > 0 ? (
                                <button type="button" onClick={prevStep} className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5">
                                    <ChevronLeft size={18} /> Back
                                </button>
                            ) : <div />}

                            {step < formSteps.length - 1 ? (
                                <button type="button" onClick={nextStep} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                                    Continue <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : 'Create Account'}
                                </button>
                            )}
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700 transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
