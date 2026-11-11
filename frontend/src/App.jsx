import {useEffect,useState} from "react";
import {Glasses,ShieldCheck,Sparkles,CircleHelp,ArrowUpRight} from "lucide-react";
import CameraStage from "./components/CameraStage.jsx";
import {getGlasses} from "./services/api.js";

const fallback=[
{id:"blue",name:"Blue",description:"Blue frame with translucent blue lenses.",frame_color:"#1A4FD1",style:"classic",model_url:"/models/model_0_blue.glb"},
{id:"tortoiseshell",name:"Tortoiseshell",description:"Classic brown tortoiseshell frame with smoke lenses.",frame_color:"#663A22",style:"classic",model_url:"/models/model_1_tortoiseshell.glb"},
{id:"black",name:"Matte Black",description:"Minimal matte black frame with smoke lenses.",frame_color:"#111111",style:"classic",model_url:"/models/model_2_black.glb"}
];

export default function App(){
  const[catalog,setCatalog]=useState(fallback);
  const[id,setId]=useState("blue");
  const[api,setApi]=useState("Bundled 3D collection");
  const selected=catalog.find(g=>g.id===id)||catalog[0];

  useEffect(()=>{
    let live=true;
    getGlasses().then((data)=>{
      if(!live || !Array.isArray(data)) return;
      // Keep the project collection fixed to the three supplied models.
      const next=fallback.map((item)=>({...item,...(data.find((row)=>row.id===item.id)||{}),model_url:item.model_url}));
      setCatalog(next);
      setId((current)=>next.some((item)=>item.id===current)?current:next[0].id);
      setApi("Live catalog · 3 models");
    }).catch(()=>live&&setApi("Bundled 3D collection"));
    return()=>{live=false};
  },[]);

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Glasses size={22}/></span><span>frame<span className="brand-light">studio</span></span></a><nav><a href="#tryon">Virtual try-on</a><a href="#collection">Collection</a><a href="#privacy">Privacy</a></nav><div className="topbar-pill"><span className="tiny-dot"/>3D TRY-ON STUDIO</div></header>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/>FIND YOUR FRAME</div><h1>A better view<br/>of <em>you.</em></h1><p>Try on your next favorite frames in real time. No guesswork, no trip to the store. Just you and a better fit.</p><div className="hero-proof"><span><ShieldCheck size={16}/>Private by design</span><span><Sparkles size={16}/>3D frame preview</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-glasses"><Glasses size={150} strokeWidth={.85}/></div><div className="art-caption"><span>FRAME 001</span><strong>Everyday / Essential</strong></div></div></section>
    <section id="tryon" className="workspace-section"><div className="section-heading"><div><div className="eyebrow">THE FITTING ROOM</div><h2>See it on you.</h2></div><span className="api-status"><span className="tiny-dot"/>{api}</span></div><div className="workspace-grid"><CameraStage glasses={selected}/><aside className="selection-panel" id="collection"><div className="panel-title"><div><span className="eyebrow">CURATED COLLECTION</span><h3>Choose your frame</h3></div><span className="count">{String(catalog.length).padStart(2,"0")}</span></div><div className="frame-list">{catalog.map(g=><button key={g.id} className={`frame-option ${id===g.id?"selected":""}`} onClick={()=>setId(g.id)} aria-pressed={id===g.id}><span className={`frame-thumb thumb-${g.style}`}><Glasses size={38} strokeWidth={1.25} style={{color:g.frame_color}}/></span><span className="frame-info"><strong>{g.name}</strong><small>{g.description}</small><span className="style-label">GLB 3D model</span></span><span className="radio-indicator">{id===g.id&&<span/>}</span></button>)}</div><div className="selected-summary"><span className="swatch" style={{background:selected.frame_color}}/><div><small>SELECTED FRAME</small><strong>{selected.name}</strong></div><ArrowUpRight size={17}/></div><div className="fit-tip"><CircleHelp size={17}/><p><strong>For the best fit</strong><br/>Face the camera in soft, even lighting. Turn your head slowly to see how the frame moves with you.</p></div></aside></div></section>
    <section className="feature-strip" id="privacy"><div><ShieldCheck size={21}/><span><strong>Your face stays yours.</strong><small>Camera processing happens locally in your browser.</small></span></div><div><Glasses size={21}/><span><strong>Frames in perspective.</strong><small>3D geometry follows detected face landmarks.</small></span></div><div><Sparkles size={21}/><span><strong>Find your everyday pair.</strong><small>Switch between styles in a single click.</small></span></div></section>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><Glasses size={18}/></span><span>frame<span className="brand-light">studio</span></span></a><span>CAPSTONE DESIGN · VIRTUAL TRY-ON MVP</span><span>Made for a clearer perspective.</span></footer>
  </main>;
}
