export const seed = [
 {id:"classic-black",name:"Classic Black",description:"Bold acetate, everyday style.",frame_color:"#202124",style:"classic",model_url:null,active:true},
 {id:"round-titanium",name:"Round Titanium",description:"Lightweight round frame.",frame_color:"#9CA3AF",style:"round",model_url:null,active:true},
 {id:"modern-amber",name:"Modern Amber",description:"Warm contemporary frame.",frame_color:"#9A5B35",style:"amber",model_url:null,active:true},
 {id:"bold-black",name:"Bold Black",description:"Thick black acetate, full 3D model.",frame_color:"#111111",style:"classic",model_url:"/models/black-acetate.glb",active:true}
];
export function validate(item, partial=false) {
 const errors=[], allowed=["id","name","description","frame_color","style","model_url","active"];
 for(const k of Object.keys(item??{})) if(!allowed.includes(k)) errors.push(`Unknown field: ${k}`);
 if(!partial || "name" in (item??{})) if(typeof item?.name!=="string" || item.name.trim().length<2) errors.push("name must be at least 2 characters");
 if("frame_color" in (item??{}) && !/^#[0-9a-fA-F]{6}$/.test(item.frame_color)) errors.push("frame_color must be a hex color");
 if("active" in (item??{}) && typeof item.active!=="boolean") errors.push("active must be boolean");
 if(item?.model_url!=null && !(typeof item.model_url==="string" && /^(\/(?!\/)|https:\/\/)/.test(item.model_url))) errors.push("model_url must be an absolute path (/models/x.glb) or an https URL");
 return errors;
}
