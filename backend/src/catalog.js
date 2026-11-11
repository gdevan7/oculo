export const seed = [
 {id:"blue",name:"Blue",description:"Blue frame with translucent blue lenses.",frame_color:"#1A4FD1",style:"classic",model_url:"/models/model-0-blue.glb",active:true},
 {id:"tortoiseshell",name:"Tortoiseshell",description:"Classic brown tortoiseshell frame with smoke lenses.",frame_color:"#663A22",style:"classic",model_url:"/models/model-1-tortoiseshell.glb",active:true},
 {id:"black",name:"Matte Black",description:"Minimal matte black frame with smoke lenses.",frame_color:"#111111",style:"classic",model_url:"/models/model-2-black.glb",active:true}
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
