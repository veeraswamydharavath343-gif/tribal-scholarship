import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail, Phone, MapPin, Wallet, GraduationCap, Calendar, IndianRupee, Pencil, Check, X } from "lucide-react";
import DocumentUploader from "@/components/profile/DocumentUploader";
import DocumentList from "@/components/profile/DocumentList";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.StudentProfile.list()
      .then((p) => setProfile(p[0] || null))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = () => {
    setForm(profile || {});
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (profile?.id) {
        const updated = await base44.entities.StudentProfile.update(profile.id, form);
        setProfile(updated);
      } else {
        const created = await base44.entities.StudentProfile.create(form);
        setProfile(created);
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="px-5 pt-20 text-center text-stone-400">Loading…</div>;

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-stone-800">My Profile</h1>
        {profile && !editing && (
          <button onClick={startEdit} className="flex items-center gap-1.5 text-emerald-700 text-sm font-medium">
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      {!profile && !editing ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center">
          <User size={32} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm mb-4">Complete your profile to apply for scholarships.</p>
          <button onClick={startEdit} className="bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">
            Create Profile
          </button>
        </div>
      ) : editing ? (
        <EditForm form={form} setForm={setForm} saving={saving} onSave={save} onCancel={() => setEditing(false)} />
      ) : (
        <ViewProfile profile={profile} />
      )}
    </div>
  );
}

function ViewProfile({ profile }) {
  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {(profile.full_name || "S").charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold">{profile.full_name}</p>
            <p className="text-emerald-100 text-sm">{profile.tribe_category || "ST Category"}</p>
          </div>
        </div>
      </div>

      <Section title="Personal Information">
        <Row icon={<Calendar size={15} />} label="Date of Birth" value={profile.date_of_birth} />
        <Row icon={<User size={15} />} label="Gender" value={profile.gender} />
        <Row icon={<Phone size={15} />} label="Mobile" value={profile.mobile_number} />
        <Row icon={<Mail size={15} />} label="Email" value={profile.email} />
        <Row icon={<MapPin size={15} />} label="Address" value={profile.residential_address} last />
      </Section>

      <Section title="Academic Details">
        <Row icon={<GraduationCap size={15} />} label="School / College" value={profile.school_college} />
        <Row icon={<GraduationCap size={15} />} label="Course" value={profile.course} />
        <Row icon={<Calendar size={15} />} label="Academic Year" value={profile.academic_year} last />
      </Section>

      <Section title="Family & Bank">
        <Row icon={<IndianRupee size={15} />} label="Family Income" value={profile.family_income} />
        <Row icon={<Wallet size={15} />} label="Bank Name" value={profile.bank_name} />
        <Row icon={<Wallet size={15} />} label="Account No." value={profile.bank_account_number} />
        <Row icon={<Wallet size={15} />} label="IFSC" value={profile.bank_ifsc} last />
      </Section>

      <Section title="Documents">
        <div className="pt-1">
          <DocumentList files={profile.document_files || []} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
      <h2 className="font-semibold text-stone-800 text-sm mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Row({ icon, label, value, last }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${last ? "" : "border-b border-stone-100"}`}>
      <div className="flex items-center gap-2 text-stone-500 text-sm">
        {icon} {label}
      </div>
      <span className="text-stone-800 text-sm font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

function EditForm({ form, setForm, saving, onSave, onCancel }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field = (label, key, type = "text") => (
    <div>
      <label className="text-stone-500 text-xs font-medium block mb-1">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={set(key)}
        className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h2 className="font-semibold text-stone-800 text-sm">Personal Information</h2>
        {field("Full Name", "full_name")}
        {field("Date of Birth", "date_of_birth", "date")}
        {field("Gender", "gender")}
        {field("Tribe / ST Category", "tribe_category")}
        {field("Mobile Number", "mobile_number", "tel")}
        {field("Email", "email", "email")}
        {field("Residential Address", "residential_address")}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h2 className="font-semibold text-stone-800 text-sm">Academic Details</h2>
        {field("School / College", "school_college")}
        {field("Course", "course")}
        {field("Academic Year", "academic_year")}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h2 className="font-semibold text-stone-800 text-sm">Family & Bank</h2>
        {field("Family Income", "family_income")}
        {field("Bank Name", "bank_name")}
        {field("Account Number", "bank_account_number")}
        {field("IFSC Code", "bank_ifsc")}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h2 className="font-semibold text-stone-800 text-sm">Documents</h2>
        <DocumentUploader
          files={form.document_files || []}
          onChange={(document_files) => setForm({ ...form, document_files })}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-2xl font-semibold flex items-center justify-center gap-1.5"
        >
          <X size={16} /> Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 bg-emerald-700 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <Check size={16} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}