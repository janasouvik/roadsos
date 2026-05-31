import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldPlus, MapPin, Bell, Users, Eye, EyeOff, Mail, User, Phone, Lock, UserPlus, Check, ShieldCheck, AlertCircle, Loader2, ArrowLeft, ArrowRight, Activity, Heart, Car, Calendar, FileText, Clipboard } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleIcon, AppleIcon } from "@/components/BrandIcons";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — ROADSOS" },
      { name: "description", content: "Create your ROADSOS account and get instant access to lifesaving emergency features." },
      { property: "og:title", content: "Sign Up for ROADSOS" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    
    // Personal Info
    dob: "",
    gender: "Male",
    bloodGroup: "O+",
    address: "",
    aadhaar: "",
    
    // Emergency Contact Details
    contactName: "",
    contactRelation: "",
    contactPhone: "",
    secondaryContactName: "",
    secondaryContactRelation: "",
    secondaryContactPhone: "",
    
    // Medical Info
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    organDonor: "No",
    disabilityInfo: "",
    
    // Vehicle Info
    vehicleNumber: "",
    vehicleType: "Car",
    vehicleModel: "",
    dlNumber: "",
    insurance: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep = (currentStep: number) => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 2) {
        setError("Full name must be at least 2 characters");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setError("Invalid email address");
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        setError("Phone number must be at least 10 digits");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (!/[A-Z]/.test(formData.password)) {
        setError("Password must contain at least one uppercase letter");
        return false;
      }
      if (!/[0-9]/.test(formData.password)) {
        setError("Password must contain at least one number");
        return false;
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        setError("Password must contain at least one special character");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.bloodGroup) {
        setError("Blood Group is mandatory");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.contactName.trim()) {
        setError("Primary emergency contact name is required");
        return false;
      }
      if (!formData.contactRelation.trim()) {
        setError("Primary contact relationship is required");
        return false;
      }
      if (!formData.contactPhone.trim() || formData.contactPhone.length < 10) {
        setError("Primary contact phone number must be at least 10 digits");
        return false;
      }
      if (formData.secondaryContactPhone && formData.secondaryContactPhone.length < 10) {
        setError("Secondary contact phone must be at least 10 digits if provided");
        return false;
      }
    } else if (currentStep === 5) {
      if (!formData.vehicleNumber.trim()) {
        setError("Vehicle Number is required");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step !== 5) {
      handleNext();
      return;
    }

    if (!validateStep(5)) return;

    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone.startsWith("+") ? formData.phone : `+91${formData.phone}`,
      password: formData.password,
      
      // Personal
      bloodGroup: formData.bloodGroup,
      dob: formData.dob || undefined,
      gender: formData.gender || undefined,
      address: formData.address || undefined,
      aadhaar: formData.aadhaar || undefined,

      // Emergency Contacts
      contactName: formData.contactName,
      contactRelation: formData.contactRelation,
      contactPhone: formData.contactPhone.startsWith("+") ? formData.contactPhone : `+91${formData.contactPhone}`,
      secondaryContactName: formData.secondaryContactName || undefined,
      secondaryContactRelation: formData.secondaryContactRelation || undefined,
      secondaryContactPhone: formData.secondaryContactPhone ? (formData.secondaryContactPhone.startsWith("+") ? formData.secondaryContactPhone : `+91${formData.secondaryContactPhone}`) : undefined,

      // Medical
      allergies: formData.allergies || undefined,
      medicalConditions: formData.medicalConditions || undefined,
      currentMedications: formData.currentMedications || undefined,
      organDonor: formData.organDonor || undefined,
      disabilityInfo: formData.disabilityInfo || undefined,

      // Vehicle
      vehicleNumber: formData.vehicleNumber,
      vehicleType: formData.vehicleType || undefined,
      vehicleModel: formData.vehicleModel || undefined,
      dlNumber: formData.dlNumber || undefined,
      insurance: formData.insurance || undefined,
    };

    const result = await signup(payload);

    if (result.success) {
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } else {
      setError(result.message);
    }
  };

  const passwordChecks = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "One number", valid: /[0-9]/.test(formData.password) },
    { label: "One special character", valid: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const steps = [
    { number: 1, title: "Account" },
    { number: 2, title: "Personal" },
    { number: 3, title: "Emergency" },
    { number: 4, title: "Medical" },
    { number: 5, title: "Vehicle" }
  ];

  return (
    <AuthLayout
      side={{
        title: <>Create Your Account and <span className="gradient-text-red">Stay Protected</span></>,
        description: "Join ROADSOS today and get instant access to lifesaving features that keep you and your loved ones safe on the road.",
        bullets: [
          { Icon: ShieldPlus, title: "Real-time Emergency Support", text: "Get help instantly, whenever and wherever you need it.", color: "#ff1e2d" },
          { Icon: MapPin, title: "Smart Location Tracking", text: "Share your live location with emergency contacts and responders.", color: "#2563ff" },
          { Icon: Bell, title: "Instant Alerts", text: "Send SOS alerts and notify the right people in seconds.", color: "#22c55e" },
          { Icon: Users, title: "Trusted by Thousands", text: "Join thousands of users who trust ROADSOS for safety and peace of mind.", color: "#9333ea" },
        ],
      }}
    >
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <h2 className="text-3xl font-bold">Sign Up</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Already have an account? <Link to="/login" className="text-brand-red font-semibold">Log in</Link>
      </p>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mt-8 mb-10 px-1">
        {steps.map((s, idx) => {
          const isCompleted = step > s.number;
          const isActive = step === s.number;
          return (
            <div key={s.number} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center relative">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-brand-green text-black font-extrabold shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                    : isActive 
                      ? 'bg-brand-red text-white ring-4 ring-brand-red/20 font-extrabold' 
                      : 'bg-white/5 text-muted-foreground border border-white/10'
                }`}>
                  {isCompleted ? <Check className="h-4.5 w-4.5" strokeWidth={3} /> : s.number}
                </div>
                <span className="text-[10px] font-bold mt-2 absolute -bottom-5 whitespace-nowrap text-muted-foreground">
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                  isCompleted ? 'bg-brand-green' : 'bg-white/5'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="h-2" />

      {error && (
        <div className="mb-4 rounded-xl p-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* STEP 1: BASIC ACCOUNT DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-red" /> 1. Basic Account Details
            </h3>
            <Field label="Full Name" Icon={User}>
              <input
                name="fullName"
                className="input-glass pr-10"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isLoading}
                id="signup-fullname"
              />
            </Field>
            <Field label="Email Address" Icon={Mail}>
              <input
                name="email"
                type="email"
                className="input-glass pr-10"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                id="signup-email"
              />
            </Field>

            <div>
              <label className="text-sm font-medium block mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <div className="input-glass !w-auto flex items-center gap-2 px-3 cursor-pointer">
                  <span className="text-base">🇮🇳</span>
                  <span className="text-sm">+91</span>
                </div>
                <div className="relative flex-1">
                  <input
                    name="phone"
                    type="tel"
                    className="input-glass pr-10"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    id="signup-phone"
                  />
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  className="input-glass pr-10"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  id="signup-password"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={show2 ? "text" : "password"}
                  className="input-glass pr-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  id="signup-confirm-password"
                />
                <button type="button" onClick={() => setShow2(!show2)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4 border border-border/60 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Lock className="h-4 w-4" /> Password must contain:
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {passwordChecks.map((check) => (
                  <li key={check.label} className="flex items-center gap-2">
                    <span className={`h-4 w-4 rounded-full flex items-center justify-center ${check.valid ? 'bg-brand-green/20 text-brand-green' : 'bg-white/5 text-muted-foreground'}`}>
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL INFORMATION */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-red" /> 2. Personal Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Blood Group <span className="text-brand-red">*</span></label>
                <select
                  name="bloodGroup"
                  className="input-glass w-full px-3.5 py-3 h-12 bg-[#0d1224] rounded-2xl border border-white/10 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg} className="bg-[#0f172a] text-white">{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Gender</label>
                <select
                  name="gender"
                  className="input-glass w-full px-3.5 py-3 h-12 bg-[#0d1224] rounded-2xl border border-white/10 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  {["Male", "Female", "Other"].map((g) => (
                    <option key={g} value={g} className="bg-[#0f172a] text-white">{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Date of Birth / Age</label>
              <div className="relative">
                <input
                  name="dob"
                  type="date"
                  className="input-glass w-full"
                  placeholder="YYYY-MM-DD"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Address</label>
              <textarea
                name="address"
                className="input-glass w-full min-h-[80px] p-3 resize-none"
                placeholder="Enter your residence address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <Field label="Aadhaar Number (Optional)" Icon={FileText}>
              <input
                name="aadhaar"
                className="input-glass pr-10"
                placeholder="Enter Aadhaar Number (Demo)"
                value={formData.aadhaar}
                onChange={handleChange}
              />
            </Field>
          </div>
        )}

        {/* STEP 3: EMERGENCY CONTACT DETAILS */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-brand-red" /> 3. Emergency Contact Details
            </h3>

            {/* Primary Contact */}
            <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.01] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-red">Primary Emergency Contact *</div>
              
              <Field label="Contact Name" Icon={User}>
                <input
                  name="contactName"
                  className="input-glass pr-10"
                  placeholder="Enter full name"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Relation" Icon={Activity}>
                <input
                  name="contactRelation"
                  className="input-glass pr-10"
                  placeholder="Relation (e.g. Spouse, Father)"
                  value={formData.contactRelation}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Phone Number" Icon={Phone}>
                <input
                  name="contactPhone"
                  type="tel"
                  className="input-glass pr-10"
                  placeholder="Contact phone number"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>

            {/* Secondary Contact */}
            <div className="rounded-2xl p-4 border border-white/5 bg-white/[0.005] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secondary Emergency Contact (Optional)</div>
              
              <Field label="Contact Name" Icon={User}>
                <input
                  name="secondaryContactName"
                  className="input-glass pr-10"
                  placeholder="Enter full name"
                  value={formData.secondaryContactName}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Relation" Icon={Activity}>
                <input
                  name="secondaryContactRelation"
                  className="input-glass pr-10"
                  placeholder="Relation (e.g. Brother, Friend)"
                  value={formData.secondaryContactRelation}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Phone Number" Icon={Phone}>
                <input
                  name="secondaryContactPhone"
                  type="tel"
                  className="input-glass pr-10"
                  placeholder="Contact phone number"
                  value={formData.secondaryContactPhone}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP 4: MEDICAL INFORMATION */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-brand-red" /> 4. Medical Information
            </h3>

            <div>
              <label className="text-sm font-medium block mb-1.5">Allergies (Optional)</label>
              <textarea
                name="allergies"
                className="input-glass w-full min-h-[60px] p-3 resize-none text-sm"
                placeholder="e.g. Penicillin, Peanuts (comma separated)"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Existing Diseases / Conditions</label>
              <textarea
                name="medicalConditions"
                className="input-glass w-full min-h-[60px] p-3 resize-none text-sm"
                placeholder="e.g. Asthma, Hypertension, Diabetes"
                value={formData.medicalConditions}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Current Medications</label>
              <textarea
                name="currentMedications"
                className="input-glass w-full min-h-[60px] p-3 resize-none text-sm"
                placeholder="List medications you take regularly"
                value={formData.currentMedications}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Organ Donor Status</label>
                <select
                  name="organDonor"
                  className="input-glass w-full px-3.5 py-3 h-12 bg-[#0d1224] rounded-2xl border border-white/10 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                  value={formData.organDonor}
                  onChange={handleChange}
                >
                  <option value="Yes" className="bg-[#0f172a] text-white">Yes, Donor</option>
                  <option value="No" className="bg-[#0f172a] text-white">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Disability Information</label>
                <input
                  name="disabilityInfo"
                  className="input-glass px-3.5 text-sm"
                  placeholder="Disabilities (if any)"
                  value={formData.disabilityInfo}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: VEHICLE INFORMATION */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Car className="h-4.5 w-4.5 text-brand-red" /> 5. Vehicle Information
            </h3>

            <div>
              <label className="text-sm font-medium block mb-1.5">Vehicle Number *</label>
              <Field label="" Icon={Clipboard}>
                <input
                  name="vehicleNumber"
                  className="input-glass pr-10 uppercase"
                  placeholder="e.g. KA-51-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Vehicle Type</label>
                <select
                  name="vehicleType"
                  className="input-glass w-full px-3.5 py-3 h-12 bg-[#0d1224] rounded-2xl border border-white/10 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  {["Bike", "Car", "Truck"].map((t) => (
                    <option key={t} value={t} className="bg-[#0f172a] text-white">{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Brand / Model</label>
                <input
                  name="vehicleModel"
                  className="input-glass px-3.5 text-sm"
                  placeholder="e.g. Hyundai i20"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Field label="Driving License Number" Icon={FileText}>
              <input
                name="dlNumber"
                className="input-glass pr-10 uppercase"
                placeholder="DL number (e.g. KA5120190000000)"
                value={formData.dlNumber}
                onChange={handleChange}
              />
            </Field>

            <Field label="Insurance Policy Number (Optional)" Icon={ShieldCheck}>
              <input
                name="insurance"
                className="input-glass pr-10"
                placeholder="Policy number"
                value={formData.insurance}
                onChange={handleChange}
              />
            </Field>

            <div className="h-2" />

            <label className="flex items-start gap-2 text-sm cursor-pointer mt-4">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-[#ff1e2d] mt-0.5"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                id="signup-terms"
              />
              <span>I agree to the <a href="#" className="text-brand-red font-semibold">Terms of Service</a> and <a href="#" className="text-brand-red font-semibold">Privacy Policy</a></span>
            </label>
          </div>
        )}

        {/* Buttons navigation */}
        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1 h-12 rounded-2xl btn-ghost-glass text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 rounded-2xl btn-emergency text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              id="signup-submit"
              disabled={isLoading || !agreed}
              className="flex-1 h-12 rounded-2xl btn-emergency text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating Profile...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Finish & Sign Up</>
              )}
            </button>
          )}
        </div>

        {step === 5 && (
          <p className="text-xs text-muted-foreground text-center">
            By signing up, you agree to receive updates and emergency notifications from ROADSOS.
          </p>
        )}
      </form>

      <div className="mt-6 rounded-2xl p-4 flex items-center gap-3 border border-border/60 bg-white/[0.02]">
        <div className="icon-tile h-10 w-10 text-brand-green"><ShieldCheck className="h-4 w-4" /></div>
        <div className="text-xs">
          <div className="font-semibold">Your safety is our priority.</div>
          <div className="text-muted-foreground">Emergency responders will access this data only in accidents.</div>
        </div>
      </div>
    </AuthLayout>
  );
}

function Field({ label, Icon, children }: { label: string; Icon: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        {children}
        <Icon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
