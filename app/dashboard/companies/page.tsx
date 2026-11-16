"use client";

import { FormEvent, useEffect, useState } from "react";

type Company = { id:number; name:string; status:string; createdAt:string; _count:{users:number;assistants:number} };

export default function CompaniesPage(){
 const [companies,setCompanies]=useState<Company[]>([]);const [name,setName]=useState("");const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");
 async function load(){setLoading(true);setError("");try{const r=await fetch("/api/companies");const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load companies.");setCompanies(d.companies||[]);}catch(e){setError(e instanceof Error?e.message:"Unable to load companies.");}finally{setLoading(false);}}
 useEffect(()=>{load();},[]);
 async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setSuccess("");setSaving(true);try{const r=await fetch("/api/companies",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to create company.");setName("");setSuccess("Company created successfully.");await load();}catch(e){setError(e instanceof Error?e.message:"Unable to create company.");}finally{setSaving(false);}}
 
 return <div className="ta-page"><div className="ta-page-heading"><div><p className="ta-eyebrow">TENANT MANAGEMENT</p><h1>Companies</h1><p>Create and manage the businesses using Trevos Assistant.</p></div><span className="ta-date-pill">{companies.length} workspace{companies.length===1?"":"s"}</span></div>
 {error&&<div className="ta-alert error">{error}</div>}{success&&<div className="ta-alert success">{success}</div>}
 <section className="ta-panel ta-form-panel"><div className="ta-panel-heading"><div><h2>Create a company workspace</h2><p>Set up a new tenant on the Trevos Assistant platform.</p></div><span className="ta-panel-icon">＋</span></div><form onSubmit={create} className="ta-inline-form"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter registered company or business name" required/><button className="ta-button primary" disabled={saving}>{saving?"Creating…":"Create company"}</button></form></section>
 <section className="ta-panel"><div className="ta-panel-heading"><div><h2>Company directory</h2><p>Workspace status, users and assistant configuration.</p></div><button className="ta-button secondary small" onClick={load}>↻ Refresh</button></div>
 {loading?<div className="ta-empty">Loading companies…</div>:companies.length===0?<div className="ta-empty">No companies have been created yet.</div>:<div className="ta-table-wrap"><table className="ta-table"><thead><tr><th>Company</th><th>Users</th><th>Assistants</th><th>Status</th><th>Created</th><th>Workspace</th></tr></thead><tbody>{companies.map(c=><tr key={c.id}><td><div className="ta-company-cell"><span className="ta-company-icon">{c.name.slice(0,1).toUpperCase()}</span><div><strong>{c.name}</strong><small>Workspace #{c.id}</small></div></div></td><td>{c._count.users}</td><td>{c._count.assistants}</td><td><span className={`ta-status ${c.status==="ACTIVE"?"good":"muted"}`}>{c.status}</span></td><td>{new Date(c.createdAt).toLocaleDateString()}</td><td><span className="ta-status info">Managed</span></td></tr>)}</tbody></table></div>}</section>
 </div>;
}
