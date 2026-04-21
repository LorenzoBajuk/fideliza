import { useState, useEffect } from "react";
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ADMIN_USER = "lorenzobajuk07@gmail.com";
const ADMIN_PASS = "Lolobajuk02";
const BUSINESS_TYPES = [
{ id:"barberia", label:"Barbería", icon:" " },
{ id:"peluqueria", label:"Peluquería", icon:" " },
{ id:"cafeteria", label:"Cafetería", icon:" " },
{ id:"restaurante", label:"Restaurante", icon:" " },
{ id:"spa", label:"Spa / Estética",icon:" " },
{ id:"gimnasio", label:"Gimnasio", icon:" " },
{ id:"otro", label:"Otro", icon:" " },
];
const PLANS = [
{ id:"inactive", label:"Sin plan", maxClients:0, color:"#5a6878", monthly:0 },
{ id:"starter", label:"Starter", maxClients:100, color:"#4d9fff", monthly:10 },
{ id:"growth", label:"Crecimiento", maxClients:300, color:"#f5a623", monthly:18 },
{ id:"pro", label:"Pro", maxClients:9999, color:"#00d4aa", monthly:28 },
];
const CYCLES = [
{ id:"monthly", label:"Mensual", months:1, disc:0 },
{ id:"semestral", label:"Semestral", months:6, disc:0.10 },
{ id:"anual", label:"Anual", months:12, disc:0.20 },
];
function cyclePrice(planId, cycleId) {
const plan = PLANS.find(p=>p.id===planId);
const cycle = CYCLES.find(c=>c.id===cycleId);
if (!plan||!cycle) return 0;
return Math.round(plan.monthly * cycle.months * (1 - cycle.disc));
}
// Days until expiry (negative = already expired)
function daysUntil(dateStr) {
if (!dateStr) return null;
return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}
const C = {
bg:"#080b0f", surface:"#0f1318", card:"#151a20", border:"#1e2530",
accent:"#00d4aa", accentDim:"#00d4aa18",
text:"#e8edf2", muted:"#5a6878", mutedLight:"#8a9bb0",
danger:"#ff5555", success:"#00d4aa", warning:"#f5a623", info:"#4d9fff", gold:"#f5c842",
};
// ─── STORAGE ─────────────────────────────────────────────────────────────────
const K = {
biz: "fz2:businesses",
data: u => `fz2:data:${u.replace(/[@.]/g,"_")}`,
pass: u => `fz2:pass:${u.replace(/[@.]/g,"_")}`,
};
const sg = async (k,v,s=false) => { try { await window.storage.set(k,JSON.stringify(v),s); }
const gg = async (k,s=false) => { try { const r=await window.storage.get(k,s); return r?JSON.
const sp = async (k,v) => { try { await window.storage.set(k,v); } catch {} };
const gp = async (k) => { try { const r=await window.storage.get(k); return r?.value??null; }
// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:${C.border};border-rad
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translat
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.fu{animation:fadeUp .3s ease forwards;}
input:focus,select:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3
`;
// ─── UI ATOMS ────────────────────────────────────────────────────────────────
const Badge = ({children,color=C.accent,small})=>(
<span style={{background:color+"18",color,border:`1px solid ${color}30`,borderRadius:6,padd
);
const Btn = ({children,onClick,variant="primary",size="md",disabled,full,icon})=>{
const sz={sm:"6px 14px",md:"10px 20px",lg:"14px 28px"};
const fs={sm:12,md:14,lg:15};
const vs={
primary:{background:`linear-gradient(135deg,${C.accent},#00b894)`,color:"#050a0e",border:
ghost:{background:"transparent",color:C.mutedLight,border:`1px solid ${C.border}`,fontWei
outline:{background:"transparent",color:C.accent,border:`1px solid ${C.accent}40`,fontWei
danger:{background:C.danger+"15",color:C.danger,border:`1px solid ${C.danger}30`,fontWeig
success:{background:C.success+"15",color:C.success,border:`1px solid ${C.success}30`,font
warn:{background:C.warning+"18",color:C.warning,border:`1px solid ${C.warning}30`,fontWei
};
return (
<button onClick={disabled?undefined:onClick} style={{...vs[variant],padding:sz[size],font
{icon&&<span>{icon}</span>}{children}
</button>
);
};
const Field = ({label,value,onChange,placeholder,type="text",hint,error})=>(
<div style={{marginBottom:16}}>
{label&&<label style={{display:"block",fontSize:11,color:C.mutedLight,marginBottom:6,font
<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={plac
style={{width:"100%",background:C.surface,border:`1px solid ${error?C.danger:C.border}`
{hint&&!error&&<p style={{fontSize:11,color:C.muted,marginTop:4}}>{hint}</p>}
{error&&<p style={{fontSize:11,color:C.danger,marginTop:4}}>{error}</p>}
</div>
);
const Modal = ({title,children,onClose,wide})=>(
<div style={{position:"fixed",inset:0,background:"#000000a0",zIndex:200,display:"flex",alig
<div className="fu" style={{background:C.card,borderRadius:20,padding:32,width:"100%",max
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBo
<span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18}}>{title}</sp
<button onClick={onClose} style={{background:C.surface,border:`1px solid ${C.border}`
</div>
{children}
</div>
</div>
);
const Spinner = ()=>(
<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flex
<div style={{width:32,height:32,border:`2px solid ${C.border}`,borderTop:`2px solid ${C.a
<span style={{color:C.muted,fontSize:13}}>Cargando...</span>
</div>
);
const EmptyState = ({icon,title,sub})=>(
<div style={{background:C.card,borderRadius:16,padding:"48px 32px",textAlign:"center",borde
<div style={{fontSize:34,marginBottom:12}}>{icon}</div>
<div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,marginBottom:6}}>{
<p style={{color:C.muted,fontSize:13,margin:0}}>{sub}</p>
</div>
);
const StatCard = ({label,value,icon,color=C.accent,sub})=>(
<div style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`,bo
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",margin
<span style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:.6,textTransform:"
<span style={{fontSize:18}}>{icon}</span>
</div>
<div style={{fontSize:28,fontWeight:800,color,fontFamily:"'Syne',sans-serif",lineHeight:1
{sub&&<div style={{fontSize:11,color:C.muted,marginTop:5}}>{sub}</div>}
</div>
);
const Logo = ({size=22})=>(
<div style={{display:"inline-flex",alignItems:"center",gap:9}}>
<div style={{width:size+8,height:size+8,background:`linear-gradient(135deg,${C.accent},#0
<span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:size,color:C.text,le
</div>
);
const AuthWrap = ({children})=>(
<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyCo
<style>{css}</style>
<div className="fu" style={{width:"100%",maxWidth:440}}>
<div style={{textAlign:"center",marginBottom:32}}><Logo size={26}/><p style={{color:C.m
{children}
</div>
</div>
);
// ─── PAYMENT / RENEWAL SCREEN ────────────────────────────────────────────────
const PaymentScreen = ({onBack, renewalMode, currentPlan, currentCycle, bizName}) => {
const [cycle, setCycle] = useState(currentCycle||"monthly");
const [plan, setPlan] = useState(currentPlan||"starter");
const activePlan = PLANS.find(p=>p.id===plan);
const total = cyclePrice(plan, cycle);
const cycleObj = CYCLES.find(c=>c.id===cycle);
const waMsg = encodeURIComponent(`Hola! ${renewalMode?"Quiero renovar":"Realicé el pag
return (
<AuthWrap>
<div style={{background:C.card,borderRadius:20,padding:28,border:`1px solid ${C.border}
<div style={{textAlign:"center",marginBottom:22}}>
<div style={{fontSize:28,marginBottom:8}}>{renewalMode?" ":" "}</div>
<h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,marginBottom:
{renewalMode?"Renovar suscripción":"Cuenta creada — activá tu plan"}
</h2>
<p style={{color:C.muted,fontSize:13,lineHeight:1.5}}>
{renewalMode?"Elegí tu plan y período, transferí y envianos el comprobante.":"Ele
</p>
</div>
{/* Cycle */}
<div style={{marginBottom:14}}>
<label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,letterSpaci
<div style={{display:"flex",gap:8}}>
{CYCLES.map(c=>(
<button key={c.id} onClick={()=>setCycle(c.id)} style={{flex:1,padding:"10px 6p
{c.label}
{c.disc>0&&<div style={{fontSize:10,marginTop:2,color:cycle===c.id?C.accent:C
</button>
))}
</div>
</div>
{/* Plans */}
<div style={{marginBottom:16,display:"grid",gap:8}}>
{PLANS.filter(p=>p.id!=="inactive").map(p=>{
const price = cyclePrice(p.id,cycle);
const monthly = cyclePrice(p.id,"monthly");
const active = plan===p.id;
return (
<button key={p.id} onClick={()=>setPlan(p.id)} style={{padding:"12px 16px",bord
<div style={{textAlign:"left"}}>
<div style={{color:active?p.color:C.text,fontWeight:700,fontSize:13}}>{p.la
<div style={{color:C.muted,fontSize:11}}>{p.maxClients===9999?"Clientes ili
</div>
<div style={{textAlign:"right"}}>
<div style={{color:active?p.color:C.text,fontWeight:800,fontSize:15}}>${pri
{cycle!=="monthly"&&<div style={{color:C.muted,fontSize:10,textDecoration:"
</div>
</button>
);
})}
</div>
{/* Bank */}
<div style={{background:C.surface,borderRadius:12,padding:14,marginBottom:14,border:`
<div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:.5,marginBottom
{[{l:"Banco",v:"Itaú"},{l:"Cuenta",v:"Caja de ahorro N° 2747164"},{l:"Moneda",v:"US
<div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"5px
<span style={{color:C.muted,fontSize:12}}>{r.l}</span>
<span style={{fontWeight:600,fontSize:12}}>{r.v}</span>
</div>
))}
</div>
<div style={{background:C.accentDim,borderRadius:10,padding:12,marginBottom:16,fontSi
Envianos el <strong style={{color:C.text}}>comprobante + nombre de tu negocio</s
</div>
<a href={`https://wa.me/59898416430?text=${waMsg}`} target="_blank" rel="noreferrer"
<button style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"p
<span style={{fontSize:18}}> </span> Enviar comprobante por WhatsApp
</button>
</a>
</div>
</AuthWrap>
<Btn variant="ghost" full onClick={onBack}>← Volver</Btn>
);
};
// ─── REGISTER ────────────────────────────────────────────────────────────────
const RegisterScreen = ({onBack, onDone}) => {
const [step, setStep] = useState(1);
const [name, setName] = useState("");
const [user, setUser] = useState("");
const [pass, setPass] = useState("");
const [pass2, setPass2] = useState("");
const [bizName, setBizName] = useState("");
const [bizType, setBizType] = useState("");
const [threshold, setThreshold] = useState(5);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const goStep2 = async () => {
setError("");
if (!name||!user||!pass||!pass2) { setError("Completá todos los campos"); return; }
if (pass!==pass2) { setError("Las contraseñas no coinciden"); return; }
if (pass.length<6) { setError("Mínimo 6 caracteres"); return; }
if (/\s/.test(user)) { setError("El usuario no puede tener espacios"); return; }
setLoading(true);
const list = (await gg(K.biz,true))||[];
if (list.find(b=>b.user===user.toLowerCase())) { setError("Ese usuario ya existe"); setLo
setLoading(false); setStep(2);
};
const register = async () => {
setError("");
if (!bizType||!bizName) { setError("Completá todos los campos"); return; }
setLoading(true);
const list = (await gg(K.biz,true))||[];
const uid = user.toLowerCase();
const nb = {id:Date.now(),user:uid,name:bizName,ownerName:name,bizType,status:"inactivo",
await sg(K.biz,[...list,nb],true);
await sg(K.data(uid),{business:nb,clients:[],visits:[],sales:[]});
await sp(K.pass(uid),pass);
setLoading(false);
onDone(uid, bizName);
};
return (
<AuthWrap>
<div style={{display:"flex",gap:6,marginBottom:24}}>
{[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?
</div>
<div style={{background:C.card,borderRadius:20,padding:32,border:`1px solid ${C.border}
{step===1&&<>
<h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,marginBottom:
<p style={{color:C.muted,fontSize:13,marginBottom:22}}>Paso 1 de 2 — Datos de acces
<Field label="Tu nombre" value={name} onChange={setName} placeholder="Ej: Carlos Ló
<Field label="Usuario" value={user} onChange={setUser} placeholder="sin espacios" h
<Field label="Contraseña" value={pass} onChange={setPass} placeholder="Mínimo 6 car
<Field label="Repetir contraseña" value={pass2} onChange={setPass2} placeholder="••
{error&&<p style={{color:C.danger,fontSize:13,marginBottom:12}}>{error}</p>}
<Btn onClick={goStep2} full size="lg" disabled={loading}>{loading?"Verificando...":
<p style={{color:C.muted,fontSize:12,textAlign:"center",marginTop:16}}>¿Ya tenés cu
</>}
{step===2&&<>
<h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,marginBottom:
<p style={{color:C.muted,fontSize:13,marginBottom:22}}>Paso 2 de 2 — Info del negoc
<Field label="Nombre del negocio" value={bizName} onChange={setBizName} placeholder
<div style={{marginBottom:16}}>
<label style={{display:"block",fontSize:11,color:C.mutedLight,marginBottom:8,font
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
{BUSINESS_TYPES.map(t=>(
<button key={t.id} onClick={()=>setBizType(t.id)} style={{padding:"10px 12px"
<span>{t.icon}</span>{t.label}
</button>
))}
</div>
</div>
<div style={{marginBottom:16}}>
<label style={{display:"block",fontSize:11,color:C.mutedLight,marginBottom:6,font
<div style={{display:"flex",alignItems:"center",gap:14}}>
<input type="range" min={3} max={15} value={threshold} onChange={e=>setThreshol
<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8
</div>
</div>
{error&&<p style={{color:C.danger,fontSize:13,marginBottom:12}}>{error}</p>}
<div style={{display:"flex",gap:10}}>
<Btn variant="ghost" onClick={()=>setStep(1)}>← Volver</Btn>
<Btn onClick={register} full size="lg" disabled={loading||!bizType||!bizName}>{lo
</div>
</>}
</div>
</AuthWrap>
);
};
// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginScreen = ({onLogin}) => {
const [user, setUser] = useState("");
const [pass, setPass] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [screen, setScreen] = useState("login"); // login | register | payment
const [pendingUser, setPendingUser] = useState("");
const [pendingBiz, setPendingBiz] = useState("");
const [renewData, setRenewData] = useState(null);
if (screen==="register") return <RegisterScreen onBack={()=>setScreen("login")} onDone={(u,
if (screen==="payment") return <PaymentScreen onBack={()=>setScreen("login")} bizName={pen
if (screen==="renewal") return <PaymentScreen onBack={()=>setScreen("login")} renewalMode
const doLogin = async () => {
setError(""); setLoading(true);
const uid = user.trim().toLowerCase();
if ((uid===ADMIN_USER||uid==="lorenzobajuk07@gmail.com")&&pass===ADMIN_PASS) { onLogin("a
const list = (await gg(K.biz,true))||[];
const found = list.find(b=>b.user===uid);
if (!found) { setError("Usuario o contraseña incorrectos"); setLoading(false); return; }
const stored = await gp(K.pass(uid));
if (stored!==pass) { setError("Usuario o contraseña incorrectos"); setLoading(false); ret
if (found.status==="inactivo") {
setPendingUser(uid); setPendingBiz(found.name);
setError("Tu cuenta está pendiente de activación.");
setLoading(false); return;
}
// Check expiry
const days = daysUntil(found.expiresAt);
if (days!==null && days<=0) {
setRenewData(found);
setError("Tu suscripción venció. Renovála para continuar.");
setLoading(false); return;
}
const data = await gg(K.data(uid));
onLogin("business", uid, found.name, data||{business:found,clients:[],visits:[],sales:[]}
setLoading(false);
};
return (
<AuthWrap>
<div style={{background:C.card,borderRadius:20,padding:32,border:`1px solid ${C.border}
<h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,marginBottom:6}
<p style={{color:C.muted,fontSize:13,marginBottom:22}}>Ingresá con tu usuario y contr
<Field label="Usuario" value={user} onChange={setUser} placeholder="tu_usuario"/>
<Field label="Contraseña" value={pass} onChange={setPass} placeholder="••••••••" type
{error&&(
<div style={{marginBottom:14}}>
<p style={{color:C.danger,fontSize:13,marginBottom:8}}>{error}</p>
{found?.status==="inactivo"&&<Btn size="sm" variant="warn" onClick={()=>setScreen
{renewData&&<Btn size="sm" variant="warn" onClick={()=>setScreen("renewal")}>Reno
</div>
)}
</div>
</AuthWrap>
<Btn onClick={doLogin} full size="lg" disabled={loading}>{loading?"Ingresando...":"In
<p style={{color:C.muted,fontSize:12,textAlign:"center",marginTop:16}}>¿No tenés cuen
);
};
// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const Sidebar = ({active,setActive,isAdmin,bizName,bizType,onLogout,saving})=>{
const nav = isAdmin
? [{id:"admin",icon:"⬡",label:"Negocios"}]
: [{id:"dashboard",icon:"◈",label:"Dashboard"},{id:"clients",icon:"◎",label:"Clientes"},{
const t = BUSINESS_TYPES.find(x=>x.id===bizType);
return (
<div style={{width:218,background:C.surface,borderRight:`1px solid ${C.border}`,display:"
<div style={{padding:"0 20px",marginBottom:32}}>
<Logo size={20}/>
{!isAdmin&&bizName&&<div style={{marginTop:12,padding:"10px 12px",background:C.card,b
<div style={{fontSize:11,color:C.muted,marginBottom:2}}>{t?.icon} {t?.label}</div>
<div style={{fontSize:13,fontWeight:600,lineHeight:1.3}}>{bizName}</div>
</div>}
{isAdmin&&<div style={{marginTop:10}}><Badge color={C.info}> Admin</Badge></div>}
</div>
<nav style={{flex:1}}>
{nav.map(item=>(
<button key={item.id} onClick={()=>setActive(item.id)} style={{display:"flex",align
<span style={{fontSize:15}}>{item.icon}</span>{item.label}
</button>
))}
</nav>
<div style={{padding:"0 14px"}}>
{saving&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",mar
<button onClick={onLogout} style={{width:"100%",padding:"10px 14px",background:"trans
</div>
</div>
);
};
// ─── RENEWAL BANNER ───────────────────────────────────────────────────────────
const RenewalBanner = ({bizInfo, onRenew}) => {
const days = daysUntil(bizInfo?.expiresAt);
if (days===null||days>10) return null;
const expired = days<=0;
return (
<div style={{background:expired?C.danger+"18":C.warning+"18",border:`1px solid ${expired?
<div>
<div style={{fontWeight:700,color:expired?C.danger:C.warning,fontSize:14,marginBottom
{expired?" Tu suscripción venció":" Tu suscripción vence pronto"}
</div>
<div style={{fontSize:12,color:C.muted}}>
{expired?"Renová ahora para seguir usando Fideliza.":`Te quedan ${days} día${days!=
</div>
</div>
<Btn size="sm" variant={expired?"danger":"warn"} onClick={onRenew}>Renovar ahora</Btn>
</div>
);
};
Date(c
// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({clients,sales,visits,threshold,bizType,bizInfo,onRenew})=>{
const t = BUSINESS_TYPES.find(x=>x.id===bizType);
const total = sales.reduce((a,s)=>a+s.amount,0);
const profit = sales.reduce((a,s)=>a+(s.amount*s.margin/100),0);
const frequent = clients.filter(c=>c.visits>=threshold);
const withReward = clients.filter(c=>c.reward);
const inactive = clients.filter(c=>c.lastVisit&&c.lastVisit!=="—"&&(new Date()-new const today = new Date().toISOString().split("T")[0];
const todayV = visits.filter(v=>v.date===today).length;
const todayS = sales.filter(s=>s.date===today).reduce((a,s)=>a+s.amount,0);
return (
<div className="fu">
<RenewalBanner bizInfo={bizInfo} onRenew={onRenew}/>
<div style={{marginBottom:24}}>
<h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBottom:4}
<p style={{color:C.muted,fontSize:13}}>{new Date().toLocaleDateString("es-AR",{weekda
</div>
<div style={{background:`linear-gradient(135deg,${C.accent}18,${C.accent}08)`,border:`1
<div><div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:3}}>HOY</div
<div style={{width:1,background:C.accent+"30"}}/>
<div><div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:3}}>VENTAS H
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}
<StatCard label="Clientes" value={clients.length} icon="◎" color={C.info}/>
<StatCard label="Frecuentes" value={frequent.length} icon=" " color={C.gold}/>
<StatCard label="Con recompensa" value={withReward.length} icon=" " color={C.success
<StatCard label="Inactivos" value={inactive.length} icon="⚠" color={C.danger}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
<StatCard label="Facturación total" value={`$${total.toLocaleString()}`} icon="◇" col
<StatCard label="Ganancia estimada" value={`$${Math.round(profit).toLocaleString()}`}
</div>
{inactive.length>0&&<div style={{background:C.danger+"0e",border:`1px solid ${C.danger}
<div style={{fontWeight:700,color:C.danger,marginBottom:12}}>⚠ Clientes sin visitar h
{inactive.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between
<span style={{fontSize:13}}>{c.name}</span>
<span style={{color:C.muted,fontSize:12}}>Última visita: {c.lastVisit}</span>
</div>)}
</div>}
</div>
);
};
// ─── LOYALTY CARD ─────────────────────────────────────────────────────────────
const LoyaltyCard = ({client,business,threshold,onClose})=>{
const progress = client.visits%threshold;
const totalCycles = Math.floor(client.visits/threshold);
const toNext = progress===0&&client.visits>0?0:threshold-progress;
const dots = Array.from({length:threshold});
const typeObj = BUSINESS_TYPES.find(t=>t.id===business?.bizType);
const bizSlug = (business?.name||"negocio").toLowerCase().replace(/\s+/g,"-").replace(/
const cSlug = client.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")
const link = `fideliza.app/${bizSlug}/${cSlug}`;
const [copied,setCopied] = useState(false);
return (
<div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",al
<div style={{width:"100%",maxWidth:400}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin
<p style={{color:C.muted,fontSize:12,margin:0}}> Vista del cliente</p>
<button onClick={onClose} style={{background:C.card,border:`1px solid ${C.border}`,
</div>
<div style={{background:"#111",borderRadius:38,padding:"13px 9px",border:"3px solid #
<div style={{background:"linear-gradient(160deg,#0a0f14,#0a1a12)",borderRadius:30,o
<div style={{background:"#ffffff08",padding:"14px 22px 12px",borderBottom:"1px so
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:24,height:24,background:`linear-gradient(135deg,${C.accent
<span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color
</div>
<span style={{fontSize:11,color:"#ffffff50"}}>{typeObj?.icon} {business?.name}<
</div>
<div style={{padding:"22px 20px"}}>
<p style={{color:"#ffffff60",fontSize:12,margin:"0 0 2px"}}>Hola </p>
<h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#f
<div style={{background:"linear-gradient(135deg,#0d2b24,#091a10)",borderRadius:
<div style={{position:"absolute",top:-25,right:-25,width:90,height:90,borderR
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-s
<div>
<p style={{color:C.accent,fontSize:10,fontWeight:700,margin:"0 0 2px",let
<p style={{color:"#ffffff60",fontSize:12,margin:0}}>Premio cada {threshol
</div>
{client.reward&&<div style={{background:C.gold+"20",border:`1px solid ${C.g
</div>
<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
{dots.map((_,i)=>(
<div key={i} style={{width:28,height:28,borderRadius:7,background:i<progr
{i<progress?"✓":""}
</div>
))}
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center
<span style={{color:"#ffffff50",fontSize:12}}>{client.reward?"¡Mostrá esta
<span style={{color:C.accent,fontWeight:800,fontFamily:"'Syne',sans-serif",
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
<div style={{background:"#ffffff07",borderRadius:11,padding:13,textAlign:"cen
<div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,colo
<div style={{color:"#ffffff40",fontSize:10,marginTop:2}}>Visitas totales</d
</div>
<div style={{background:"#ffffff07",borderRadius:11,padding:13,textAlign:"cen
<div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,colo
<div style={{color:"#ffffff40",fontSize:10,marginTop:2}}>Premios ganados</d
</div>
</div>
</div>
</div>
</div>
<div style={{marginTop:12,background:C.card,borderRadius:14,padding:14,border:`1px so
<p style={{fontSize:11,color:C.muted,margin:"0 0 8px",fontWeight:600,letterSpacing:
<div style={{display:"flex",gap:8}}>
<div style={{flex:1,background:C.surface,borderRadius:8,padding:"8px 12px",fontSi
<Btn size="sm" variant="outline" onClick={()=>setCopied(true)}>{copied?"✓":"Copia
</div>
<p style={{color:C.muted,fontSize:11,marginTop:8}}> El cliente guarda este </div>
link p
</div>
</div>
);
};
// ─── CLIENTS ─────────────────────────────────────────────────────────────────
const Clients = ({clients,setClients,visits,threshold,business})=>{
const [modal, setModal] = useState(false);
const [hist, setHist] = useState(null);
const [card, setCard] = useState(null);
const [newCl, setNewCl] = useState(null);
const [search, setSearch] = useState("");
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const bizSlug = (business?.name||"negocio").toLowerCase().replace(/\s+/g,"-").replace(/[^a-
const cLink = n=>`fideliza.app/${bizSlug}/${n.toLowerCase().replace(/\s+/g,"-").replace(/
const waUrl = cl=>{
const msg=`¡Hola ${cl.name.split(" ")[0]}! Te registramos en *${business?.name||"el ne
return `https://wa.me/${(cl.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}
};
const plan = PLANS.find(p=>p.id===(business?.plan||"inactive"));
const add = ()=>{
if (!name.trim()) return;
if (plan&&plan.maxClients>0&&plan.maxClients<9999&&clients.length>=plan.maxClients) {
alert(`Alcanzaste el límite de ${plan.maxClients} clientes de tu plan ${plan.label}. Co
}
const cl={id:Date.now(),name,phone,visits:0,lastVisit:"—",reward:false};
setClients(p=>[...p,cl]); setNewCl(cl); setName(""); setPhone(""); setModal(false);
};
const filtered = clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.p
const cv = id=>visits.filter(v=>v.clientId===id);
return (
<div className="fu">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBo
<div>
<h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBottom:
<p style={{color:C.muted,fontSize:13}}>{clients.length} clientes registrados{plan&&
</div>
<Btn onClick={()=>setModal(true)} icon="+">Nuevo cliente</Btn>
</div>
{/* Plan usage bar */}
{plan&&plan.maxClients>0&&plan.maxClients<9999&&(()=>{
const pct=Math.min(clients.length/plan.maxClients*100,100);
const near=pct>=80;
return <div style={{background:near?C.danger+"0e":C.card,border:`1px solid ${near?C.d
<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom
<span style={{color:C.muted}}>Plan <strong style={{color:plan.color}}>{plan.label
<span style={{color:near?C.danger:C.muted}}>{clients.length}/{plan.maxClients} cl
</div>
<div style={{height:4,background:C.border,borderRadius:2}}><div style={{width:`${pc
{near&&<div style={{marginTop:8,fontSize:12,color:C.danger}}>⚠ Cerca del límite. <a
</div>;
})()}
<input value={search} onChange={e=>setSearch(e.target.value)} placeholder=" Buscar p
style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12
{filtered.length===0
? <EmptyState icon="◎" title="No hay clientes" sub={search?"Sin resultados para esa b
: <div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overf
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.surface}}>
{["Cliente","Teléfono","Visitas","Última visita","Estado",""].map(h=><th key=
</tr></thead>
<tbody>
{filtered.map((c,i)=>{
const inactive=c.lastVisit!=="—"&&(new Date()-new Date(c.lastVisit))/864000
return <tr key={c.id} style={{borderTop:`1px solid ${C.border}`,background:
<td style={{padding:"13px 16px",fontWeight:600}}>{c.name}</td>
<td style={{padding:"13px 16px",color:C.muted,fontSize:13}}>{c.phone||"—"
<td style={{padding:"13px 16px"}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<span style={{fontWeight:700}}>{c.visits}</span>
<div style={{width:48,height:3,background:C.border,borderRadius:2}}><
</div>
</td>
<td style={{padding:"13px 16px",color:C.muted,fontSize:12}}>{c.lastVisit}
<td style={{padding:"13px 16px"}}>
{inactive?<Badge color={C.danger} small>Inactivo</Badge>:c.reward?<Badg
</td>
<td style={{padding:"13px 16px"}}>
<div style={{display:"flex",gap:6}}>
<Btn size="sm" variant="outline" onClick={()=>setCard(c)}> Tarjeta<
<Btn size="sm" variant="ghost" onClick={()=>setHist(c)}>Historial</Bt
</div>
</td>
</tr>;
})}
</tbody>
</table>
</div>
}
{modal&&<Modal title="Nuevo cliente" onClose={()=>setModal(false)}>
<Field label="Nombre completo" value={name} onChange={setName} placeholder="Ej: Juan
<Field label="Teléfono (opcional)" value={phone} onChange={setPhone} placeholder="555
<div style={{display:"flex",gap:10,marginTop:8}}>
<Btn onClick={add} disabled={!name.trim()}>Guardar</Btn>
<Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
</div>
</Modal>}
{newCl&&<Modal title=" Cliente registrado" onClose={()=>setNewCl(null)}>
<div style={{textAlign:"center",padding:"4px 0 18px"}}>
<div style={{width:52,height:52,background:C.accent+"18",border:`2px solid ${C.acce
<h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,marginBottom:
<p style={{color:C.muted,fontSize:13}}>Mandále su tarjeta ahora — es la única vez q
</div>
<div style={{background:C.surface,borderRadius:12,padding:14,marginBottom:18,border:`
<p style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600,letterSpacing:.5
<div style={{background:"#0d1f0d",borderRadius:10,padding:12,fontSize:12,lineHeight
¡Hola <strong style={{color:"#fff"}}>{newCl.name.split(" ")[0]}</strong>! Te r
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<a href={waUrl(newCl)} target="_blank" rel="noreferrer" style={{textDecoration:"non
<button style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:
<span style={{fontSize:18}}> </span> Abrir WhatsApp y enviar tarjeta
</button>
</a>
</div>
</Modal>}
<Btn variant="ghost" full onClick={()=>setNewCl(null)}>Ahora no</Btn>
<p style={{color:C.muted,fontSize:11,textAlign:"center",marginTop:12}}>El link es per
{hist&&<Modal title={`Historial — ${hist.name}`} onClose={()=>setHist(null)}>
<div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
<Badge>{hist.visits} visitas</Badge>
{hist.reward&&<Badge color={C.gold}> Con premio</Badge>}
</div>
{cv(hist.id).length===0?<p style={{color:C.muted,fontSize:13}}>Sin visitas aún.</p>
:cv(hist.id).sort((a,b)=>b.date.localeCompare(a.date)).map(v=>(
<div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"10
<span style={{fontSize:13}}>{v.note||"Visita"}</span>
<span style={{color:C.muted,fontSize:12}}>{v.date}</span>
</div>
))
}
</Modal>}
{card&&<LoyaltyCard client={card} business={business} threshold={threshold} onClose={()
</div>
);
};
// ─── VISITS ──────────────────────────────────────────────────────────────────
const Visits = ({clients,setClients,visits,setVisits,threshold,business})=>{
const [modal, setModal] = useState(false);
const [sel, setSel] = useState("");
const [note, setNote] = useState("");
const [sent, setSent] = useState(null);
const today = new Date().toISOString().split("T")[0];
const bizSlug = (business?.name||"negocio").toLowerCase().replace(/\s+/g,"-").replace(/[^a-
const cLink = n=>`fideliza.app/${bizSlug}/${n.toLowerCase().replace(/\s+/g,"-").replace(/
const buildMsg = (cl,nv)=>{
const first=cl.name.split(" ")[0];
const biz=business?.name||"el negocio";
const link=cLink(cl.name);
const toNext=threshold-(nv%threshold);
const isReward=nv%threshold===0;
if (isReward) return `¡Hola ${first}! if (toNext===1) return `¡Hola ${first}! return `¡Hola ${first}! ¡Felicitaciones! Completaste tus ${threshold} vi
Ya tenés ${nv} visitas en *${biz}*. ¡Te falta
Registramos tu visita en *${biz}*. Llevás ${nv} de ${threshold
};
const waUrl = (cl,nv)=>`https://wa.me/${(cl.phone||"").replace(/\D/g,"")}?text=${encodeURIC
const reg = ()=>{
if (!sel) return;
const cid=parseInt(sel);
const clBefore=clients.find(c=>c.id===cid);
const nv=(clBefore?.visits||0)+1;
setVisits(p=>[...p,{id:Date.now(),clientId:cid,date:today,note}]);
setClients(p=>p.map(c=>c.id!==cid?c:{...c,visits:nv,lastVisit:today,reward:nv%threshold==
setSent({client:clBefore,nv});
setSel(""); setNote(""); setModal(false);
};
const sc = clients.find(c=>c.id===parseInt(sel));
const recent = [...visits].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);
return (
<div className="fu">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBo
<div>
<h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBottom:
<p style={{color:C.muted,fontSize:13}}>{visits.length} visitas en total</p>
</div>
<Btn onClick={()=>setModal(true)} icon="✦">Registrar visita</Btn>
</div>
{visits.length===0?<EmptyState icon="✦" title="Sin visitas todavía" sub="Registrá la pr
:<div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overfl
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.surface}}>
{["Cliente","Fecha","Nota","Visitas"].map(h=><th key={h} style={{padding:"11px
</tr></thead>
<tbody>
{recent.map((v,i)=>{
const cl=clients.find(c=>c.id===v.clientId);
return <tr key={v.id} style={{borderTop:`1px solid ${C.border}`,background:i%
<td style={{padding:"13px 16px",fontWeight:600}}>{cl?.name||"—"}</td>
<td style={{padding:"13px 16px",color:C.muted,fontSize:12}}>{v.date}</td>
<td style={{padding:"13px 16px",color:C.muted,fontSize:12}}>{v.note||"—"}</
<td style={{padding:"13px 16px"}}><Badge color={cl?.reward?C.gold:C.accent}
</tr>;
})}
</tbody>
</table>
</div>
}
{modal&&<Modal title="Registrar visita" onClose={()=>setModal(false)}>
<div style={{marginBottom:14}}>
<label style={{display:"block",fontSize:11,color:C.mutedLight,marginBottom:6,fontWe
<select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",backg
<option value="">Seleccionar cliente...</option>
{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
</select>
</div>
{sc&&<div style={{background:C.accentDim,border:`1px solid ${C.accent}30`,borderRadiu
<strong>{sc.name}</strong> · {sc.visits} visitas · Faltan <strong style={{color:C.a
{sc.reward&&<div style={{color:C.gold,fontWeight:700,marginTop:4}}> ¡Tiene premio
</div>}
<Field label="Nota (opcional)" value={note} onChange={setNote} placeholder="Ej: Corte
<div style={{display:"flex",gap:10}}>
<Btn onClick={reg} disabled={!sel}>Registrar</Btn>
<Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
</div>
</Modal>}
{sent&&(()=>{
const {client:cl,nv}=sent;
const isReward=nv%threshold===0;
const toNext=threshold-(nv%threshold);
return <Modal title={isReward?" ¡Premio ganado!":" Visita registrada"} onClose={
<div style={{textAlign:"center",padding:"4px 0 16px"}}>
<div style={{width:50,height:50,background:isReward?C.gold+"20":C.accent+"18",bor
<h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,marginBotto
{isReward?`¡${cl.name.split(" ")[0]} ganó su premio!`:`Visita ${nv} de ${thresh
</h3>
<p style={{color:C.muted,fontSize:13}}>{isReward?"¡Completó el ciclo!":toNext===1
</div>
<div style={{background:C.surface,borderRadius:12,padding:14,marginBottom:16,border
<p style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600,letterSpacing:
<div style={{background:"#0d1f0d",borderRadius:10,padding:12,fontSize:12,lineHeig
</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<a href={waUrl(cl,nv)} target="_blank" rel="noreferrer" style={{textDecoration:"n
<button style={{width:"100%",padding:"13px",borderRadius:12,border:"none",curso
<span style={{fontSize:18}}> </span> Enviar por WhatsApp
</button>
</a>
</div>
</Modal>;
})()}
</div>
<Btn variant="ghost" full onClick={()=>setSent(null)}>Omitir</Btn>
);
};
// ─── SALES ────────────────────────────────────────────────────────────────────
const Sales = ({sales,setSales})=>{
const [modal,setModal]=useState(false);
const [desc,setDesc]=useState("");
const [amt,setAmt]=useState("");
const [mgn,setMgn]=useState("");
const today=new Date().toISOString().split("T")[0];
const add=()=>{
if(!desc||!amt||!mgn) return;
setSales(p=>[...p,{id:Date.now(),description:desc,amount:parseFloat(amt),margin:parseFloa
setDesc(""); setAmt(""); setMgn(""); setModal(false);
};
const total=sales.reduce((a,s)=>a+s.amount,0);
const profit=sales.reduce((a,s)=>a+(s.amount*s.margin/100),0);
return (
<div className="fu">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBo
<div><h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBott
<Btn onClick={()=>setModal(true)} icon="◇">Nueva venta</Btn>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
<StatCard label="Facturación total" value={`$${total.toLocaleString()}`} icon="◇" col
<StatCard label="Ganancia estimada" value={`$${Math.round(profit).toLocaleString()}`}
</div>
{sales.length===0?<EmptyState icon="◇" title="Sin ventas todavía" sub="Registrá tu prim
:<div style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overfl
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.surface}}>{["Descripción","Fecha","Monto","Margen
<tbody>{[...sales].reverse().map((s,i)=>(
<tr key={s.id} style={{borderTop:`1px solid ${C.border}`,background:i%2===0?"tr
<td style={{padding:"13px 16px",fontWeight:600}}>{s.description}</td>
<td style={{padding:"13px 16px",color:C.muted,fontSize:12}}>{s.date}</td>
<td style={{padding:"13px 16px",fontWeight:700}}>${s.amount.toLocaleString()}
<td style={{padding:"13px 16px"}}><Badge color={C.info} small>{s.margin}%</Ba
<td style={{padding:"13px 16px",color:C.success,fontWeight:700}}>${Math.round
</tr>
))}</tbody>
</table>
</div>
}
{modal&&<Modal title="Nueva venta" onClose={()=>setModal(false)}>
<Field label="Descripción" value={desc} onChange={setDesc} placeholder="Ej: Corte pre
<Field label="Monto ($)" value={amt} onChange={setAmt} type="number" placeholder="500
<Field label="Margen de ganancia (%)" value={mgn} onChange={setMgn} type="number" pla
{amt&&mgn&&<div style={{background:C.success+"12",border:`1px solid ${C.success}25`,b
<div style={{display:"flex",gap:10}}>
<Btn onClick={add} disabled={!desc||!amt||!mgn}>Guardar</Btn>
<Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
</div>
</Modal>}
</div>
);
};
// ─── SETTINGS ────────────────────────────────────────────────────────────────
const Settings = ({business,onUpdate})=>{
const [bizName, setBizName] = useState(business?.name||"");
const [bizType, setBizType] = useState(business?.bizType||"");
const [threshold, setThreshold] = useState(business?.rewardThreshold||5);
const [saved, setSaved] = useState(false);
const save=()=>{ onUpdate({...business,name:bizName,bizType,rewardThreshold:threshold}); se
return (
<div className="fu">
<h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBottom:4}}>
<p style={{color:C.muted,fontSize:13,marginBottom:24}}>Configurá tu negocio y las regla
<div style={{background:C.card,borderRadius:16,padding:28,border:`1px solid ${C.border}
<Field label="Nombre del negocio" value={bizName} onChange={setBizName} placeholder="
<div style={{marginBottom:16}}>
<label style={{display:"block",fontSize:11,color:C.mutedLight,marginBottom:8,fontWe
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
{BUSINESS_TYPES.map(t=>(
<button key={t.id} onClick={()=>setBizType(t.id)} style={{padding:"10px 12px",b
<span>{t.icon}</span>{t.label}
</button>
))}
</div>
</div>
<div style={{marginBottom:22}}>
<label style={{display:"block",fontSize:11,color:C.mutedLight,marginBottom:6,fontWe
<div style={{display:"flex",alignItems:"center",gap:14}}>
<input type="range" min={3} max={15} value={threshold} onChange={e=>setThreshold(
<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,p
</div>
</div>
<Btn onClick={save} size="lg">{saved?"✓ Guardado":"Guardar cambios"}</Btn>
</div>
</div>
);
};
// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
const MOCK = [
{id:1,user:"magno", name:"Barbería Magno", ownerName:"Carlos López", bizType:"barber
{id:2,user:"aroma", name:"Cafetería Aroma", ownerName:"Ana Rodríguez", bizType:"cafete
{id:3,user:"bella", name:"Peluquería Bella", ownerName:"Sofía Martínez",bizType:"peluqu
{id:4,user:"serenidad",name:"Spa Serenidad", ownerName:"Lucía Torres", bizType:"spa",
{id:5,user:"elsol", name:"Restaurante El Sol",ownerName:"Miguel García", bizType:"restau
];
const AdminPanel = ()=>{
const [list, setList] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [editB, setEditB] = useState(null); // business being edited
const [newPass, setNewPass] = useState("");
const [passSaved,setPassSaved]=useState(false);
useEffect(()=>{ gg(K.biz,true).then(l=>{ setList(l||[]); setLoading(false); }); },[]);
const save = async updated => { setList(updated); await sg(K.biz,updated,true); };
const setPlan = (id,planId)=>{
const plan=PLANS.find(p=>p.id===planId);
save(list.map(b=>b.id===id?{...b,plan:planId,status:planId==="inactive"?"inactivo":"activ
};
const setCycle = (id,cycleId)=>save(list.map(b=>b.id===id?{...b,cycle:cycleId}:b));
const setExpiry = (id,date)=>save(list.map(b=>b.id===id?{...b,expiresAt:date||null}:b));
const removeB = id=>save(list.filter(b=>b.id!==id));
const savePass = async ()=>{
if (!newPass||newPass.length<4) return;
await sp(K.pass(editB.user),newPass);
setPassSaved(true); setTimeout(()=>{ setPassSaved(false); setNewPass(""); },1500);
};
if (loading) return <Spinner/>;
const typeOf = bt=>BUSINESS_TYPES.find(t=>t.id===bt);
const planOf = b=>PLANS.find(p=>p.id===(b.plan||"inactive"))||PLANS[0];
const revenue = list.filter(b=>b.status==="activo").reduce((a,b)=>{
const p=PLANS.find(pl=>pl.id===b.plan); return a+(p?p.monthly:0);
},0);
const filtered = list.filter(b=>
b.name.toLowerCase().includes(search.toLowerCase())||
b.user.toLowerCase().includes(search.toLowerCase())||
b.ownerName?.toLowerCase().includes(search.toLowerCase())
);
return (
<div className="fu">
<h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBottom:4}}>
<p style={{color:C.muted,fontSize:13,marginBottom:20}}>{list.length} negocios registrad
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}
<StatCard label="Total" value={list.length} icon=" " color={C.info}/>
<StatCard label="Activos" value={list.filter(b=>b.status==="activo").length} icon="✓"
<StatCard label="Pendientes" value={list.filter(b=>b.status==="inactivo").length} ico
<StatCard label="Ingreso/mes" value={`$${revenue}`} icon=" " color={C.gold} sub="USD
</div>
{/* Search */}
<input value={search} onChange={e=>setSearch(e.target.value)} placeholder=" Buscar n
style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12
otro t
{filtered.length===0?<EmptyState icon=" " title="Sin resultados" sub="Probá con :<div style={{display:"grid",gap:10}}>
{filtered.map(b=>{
const t=typeOf(b.bizType);
const plan=planOf(b);
const cycle=CYCLES.find(c=>c.id===(b.cycle||"monthly"));
const days=daysUntil(b.expiresAt);
const expiring=days!==null&&days<=10&&days>0;
const expired=days!==null&&days<=0;
const pct=plan.maxClients>0&&plan.maxClients<9999?Math.min((b.clients||0)/plan.ma
return (
<div key={b.id} style={{background:C.card,borderRadius:14,padding:20,border:`1p
{/* Header */}
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-s
<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
<span style={{fontWeight:800,fontSize:16}}>{b.name}</span>
<Badge color={b.status==="activo"?C.success:C.danger} small>{b.status==
{expiring&&<Badge color={C.warning} small>⚠ Vence en {days}d</Badge>}
{expired&&<Badge color={C.danger} small> Vencido</Badge>}
</div>
<div style={{color:C.muted,fontSize:12}}>{t?`${t.icon} ${t.label}`:"—"} ·
</div>
<div style={{display:"flex",gap:8}}>
<Btn size="sm" variant="ghost" onClick={()=>{ setEditB(b); setNewPass("")
<Btn size="sm" variant="danger" onClick={()=>removeB(b.id)}>Eliminar</Btn
</div>
</div>
{/* Expiry date */}
<div style={{marginBottom:14}}>
<label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,let
<div style={{display:"flex",alignItems:"center",gap:10}}>
<input type="date" value={b.expiresAt||""} onChange={e=>setExpiry(b.id,e.
style={{background:C.surface,border:`1px solid ${expired?C.danger:expir
{b.expiresAt&&<span style={{fontSize:12,color:expired?C.danger:expiring?C
{expired?"Vencido":`${days} día${days!==1?"s":""} restantes`}
</span>}
{!b.expiresAt&&<span style={{fontSize:12,color:C.muted}}>Sin fecha </div>
</div>
asigna
{/* Plan */}
<div style={{marginBottom:14}}>
<label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,let
<div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
{PLANS.map(p=>(
<button key={p.id} onClick={()=>setPlan(b.id,p.id)} style={{padding:"6p
{p.label}{p.monthly>0&&<span style={{opacity:.7}}> · ${p.monthly}/mes
</button>
))}
</div>
</div>
{/* Cycle */}
{b.plan!=="inactive"&&<div style={{marginBottom:14}}>
<label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,let
<div style={{display:"flex",gap:7}}>
{CYCLES.map(c=>(
<button key={c.id} onClick={()=>setCycle(b.id,c.id)} style={{padding:"6
{c.label}{c.disc>0&&<span style={{opacity:.7}}> −{c.disc*100}%</span>
</button>
))}
</div>
{b.plan!=="inactive"&&<div style={{marginTop:6,fontSize:11,color:C.muted}}>
Total a cobrar: <strong style={{color:C.accent}}>${cyclePrice(b.plan,b.cy
</div>}
</div>}
{/* Client bar */}
{b.status==="activo"&&plan.maxClients>0&&<div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:12,colo
<span>Clientes: <strong style={{color:C.text}}>{b.clients||0}</strong> /
{plan.maxClients<9999&&<span style={{color:pct>=90?C.danger:C.muted}}>{Ma
</div>
{plan.maxClients<9999&&<div style={{height:3,background:C.border,borderRadi
</div>}
</div>
);
})}
</div>
}
{/* Change password modal */}
{editB&&<Modal title={` Cambiar contraseña — ${editB.name}`} onClose={()=>setEditB(nu
<p style={{color:C.muted,fontSize:13,marginBottom:16}}>Usuario: <strong style={{color
<Field label="Nueva contraseña" value={newPass} onChange={setNewPass} placeholder="Mí
<div style={{display:"flex",gap:10,marginTop:8}}>
<Btn onClick={savePass} disabled={newPass.length<4}>{passSaved?"✓ Guardada":"Guarda
<Btn variant="ghost" onClick={()=>setEditB(null)}>Cancelar</Btn>
</div>
<p style={{color:C.muted,fontSize:11,marginTop:10}}>El negocio puede ingresar con est
</Modal>}
</div>
);
};
// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
const [screen, setScreen] = useState("login");
const [isAdmin, setIsAdmin] = useState(false);
const [active, setActive] = useState("dashboard");
const [curUser, setCurUser] = useState("");
const [clients, setClients] = useState([]);
const [visits, setVisits] = useState([]);
const [sales, setSales] = useState([]);
const [business, setBusiness] = useState(null);
const [bizInfo, setBizInfo] = useState(null); // plan/expiry info
const [saving, setSaving] = useState(false);
const [showRenew,setShowRenew]= useState(false);
const threshold = business?.rewardThreshold||5;
// Auto-save
useEffect(()=>{
if (!curUser||isAdmin) return;
setSaving(true);
const t=setTimeout(async()=>{
await sg(K.data(curUser),{business,clients,visits,sales});
const list=(await gg(K.biz,true))||[];
await sg(K.biz,list.map(b=>b.user===curUser?{...b,clients:clients.length,name:business?
setSaving(false);
},900);
return ()=>clearTimeout(t);
},[clients,visits,sales,business]);
// Check renewal on load
useEffect(()=>{
if (!bizInfo||isAdmin) return;
const days=daysUntil(bizInfo.expiresAt);
if (days!==null&&days<=10) setShowRenew(true);
},[bizInfo]);
const handleLogin = (mode,user,name,data,info)=>{
setIsAdmin(mode==="admin");
if (mode==="business") {
setCurUser(user);
setBusiness(data?.business||{name,rewardThreshold:5});
setBizInfo(info||null);
setClients(data?.clients||[]);
setVisits(data?.visits||[]);
setSales(data?.sales||[]);
setActive("dashboard");
} else {
setActive("admin");
}
setScreen("app");
};
const logout=()=>{ setScreen("login"); setCurUser(""); setBusiness(null); setBizInfo(null);
if (screen==="login") return <LoginScreen onLogin={handleLogin}/>;
if (showRenew&&!isAdmin) return <PaymentScreen onBack={()=>setShowRenew(false)} renewalMode
return (
<div style={{display:"flex",height:"100vh",background:C.bg,color:C.text,fontFamily:"'DM S
<style>{css}</style>
<Sidebar active={active} setActive={setActive} isAdmin={isAdmin} bizName={business?.nam
<main style={{flex:1,overflowY:"auto",padding:32}}>
{active==="dashboard" &&!isAdmin&&<Dashboard clients={clients} sales={sales} visits={
{active==="clients" &&!isAdmin&&<Clients clients={clients} setClients={setClients}
{active==="visits" &&!isAdmin&&<Visits clients={clients} setClients={setClients}
{active==="sales" &&!isAdmin&&<Sales sales={sales} setSales={setSales}/>}
{active==="settings" &&!isAdmin&&<Settings business={business} onUpdate={b=>setBusin
{active==="admin" && isAdmin&&<AdminPanel/>}
</main>
</div>
);
}
