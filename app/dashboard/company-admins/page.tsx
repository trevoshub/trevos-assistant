"use client";

import { FormEvent, useEffect, useState } from "react";

type Company = { id: number; name: string; status: string };
type Admin = { id: number; name: string; email: string; role: string; companyId: number | null; createdAt: string; company: Company | null };

export default function CompanyAdminsPage() {
  const [admins,setAdmins]=useState<Admin[]>([]);
  const [companies,setCompanies]=useState<Company[]>([]);
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [companyId,setCompanyId]=useState("");
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(""); const [success,setSuccess]=useState("");
  const [resetAdmin,setResetAdmin]=useState<Admin|null>(null); const [newPassword,setNewPassword]=useState(""); const [resetting,setResetting]=useState(false);
  async function load(){setLoading(true);setError("");try{const r=await fetch("/api/company-admins");const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load administrators.");setAdmins(d.admins||[]);setCompanies(d.companies||[]);}catch(e){setError(e instanceof Error?e.message:"Unable to load administrators.");}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);
  async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setSuccess("");if(password.length<8){setError("Temporary password must contain at least 8 characters.");return;}setSaving(true);try{const r=await fetch("/api/company-admins",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password,companyId:Number(companyId)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to create administrator.");setName("");setEmail("");setPassword("");setCompanyId("");setSuccess("Company administrator created successfully.");await load();}catch(e){setError(e instanceof Error?e.message:"Unable to create administrator.");}finally{setSaving(false);}}
  async function reset(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!resetAdmin)return;setError("");setSuccess("");if(newPassword.length<8){setError("New password must contain at least 8 characters.");return;}setResetting(true);try{const r=await fetch("/api/company-admins",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:resetAdmin.id,newPassword})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to reset password.");setSuccess(`Password reset successfully for ${resetAdmin.name}. Share the temporary password securely.`);setResetAdmin(null);setNewPassword("");}catch(e){setError(e instanceof Error?e.message:"Unable to reset password.");}finally{setResetting(false);}}
  return <div className="ta-page">
    <div className="ta-page-heading"><div><p className="ta-eyebrow">ACCESS MANAGEMENT</p><h1>Company administrators</h1><p>Create administrator accounts and manage access to company workspaces.</p></div><span className="ta-date-pill">{admins.length} administrator{admins.length===1?"":"s"}</span></div>
    {error&&<div className="ta-alert error">{error}</div>}{success&&<div className="ta-alert success">{success}</div>}
    <section className="ta-panel ta-form-panel"><div className="ta-panel-heading"><div><h2>Add a company administrator</h2><p>Create a login for a company workspace.</p></div><span className="ta-panel-icon">＋</span></div>
      <form onSubmit={create} className="ta-form-grid">
        <label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Jane Doe" required /></label>
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@company.com" required /></label>
        <label>Temporary password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} placeholder="At least 8 characters" required /></label>
        <label>Company workspace<select value={companyId} onChange={e=>setCompanyId(e.target.value)} required><option value="">Select a company</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}{c.status==="SUSPENDED"?" (Suspended)":""}</option>)}</select></label>
        <div className="ta-form-actions"><button className="ta-button primary" disabled={saving||!companies.length}>{saving?"Creating account…":"Create administrator"}</button><span>Passwords are securely hashed before storage.</span></div>
      </form>
    </section>
    <section className="ta-panel"><div className="ta-panel-heading"><div><h2>Administrator directory</h2><p>All company administrator accounts on this platform.</p></div><button className="ta-button secondary small" onClick={load}>↻ Refresh</button></div>
      {loading?<div className="ta-empty">Loading administrators…</div>:admins.length===0?<div className="ta-empty">No company administrators have been created.</div>:<div className="ta-table-wrap"><table className="ta-table"><thead><tr><th>Administrator</th><th>Company</th><th>Access</th><th>Created</th><th>Actions</th></tr></thead><tbody>{admins.map(a=><tr key={a.id}><td><div className="ta-person"><span className="ta-avatar">{a.name.slice(0,1).toUpperCase()}</span><div><strong>{a.name}</strong><small>{a.email}</small></div></div></td><td>{a.company?.name||"Unassigned"}</td><td><span className={`ta-status ${a.company?.status==="ACTIVE"?"good":"muted"}`}>{a.company?.status||"UNASSIGNED"}</span></td><td>{new Date(a.createdAt).toLocaleDateString()}</td><td><button className="ta-button secondary small" onClick={()=>{setResetAdmin(a);setNewPassword("");}}>Reset password</button></td></tr>)}</tbody></table></div>}
    </section>
    {resetAdmin&&<div className="ta-modal-backdrop" role="presentation"><section className="ta-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><button className="ta-modal-close" onClick={()=>setResetAdmin(null)} aria-label="Close">×</button><p className="ta-eyebrow">ACCOUNT SECURITY</p><h2 id="reset-title">Reset administrator password</h2><p>Set a temporary password for <strong>{resetAdmin.name}</strong> ({resetAdmin.email}). The current password will stop working immediately.</p><form onSubmit={reset}><label>New temporary password<input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength={8} autoComplete="new-password" required placeholder="At least 8 characters"/></label><div className="ta-modal-actions"><button type="button" className="ta-button secondary" onClick={()=>setResetAdmin(null)}>Cancel</button><button className="ta-button primary" disabled={resetting}>{resetting?"Resetting…":"Reset password"}</button></div></form><small className="ta-modal-note">Share the temporary password with the administrator through a secure channel. This action does not email the password.</small></section></div>}
  </div>;
}
