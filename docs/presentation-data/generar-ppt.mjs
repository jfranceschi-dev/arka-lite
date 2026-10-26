/**
 * Fuente editable de las presentaciones.
 * Contenido: los dos guiones Markdown. Diagramas: diagramas.mjs.
 * Runtime: @oai/artifact-tool suministrado por Codex.
 * Ejecutar mediante generar-ppt.ps1; no instala paquetes ni modifica Java.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {diagrams, diagramSlides} from './diagramas.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const modules = process.env.ARKA_NODE_MODULES;
if (!modules) throw new Error('Define ARKA_NODE_MODULES o usa generar-ppt.ps1');
const require = createRequire(path.join(modules, '_arka_loader.cjs'));
const {Presentation, PresentationFile} = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const theme = { navy:'#102D50', blue:'#185DA2', pale:'#EAF2FA', ink:'#16324F', muted:'#4F6B86', white:'#FFFFFF', font:'Arial' };
const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const build = path.join(root,'.build',stamp);
const output = path.join(root,'output',stamp);
await fs.mkdir(build,{recursive:true});
await fs.mkdir(output,{recursive:true});

function plain(s) { return s.replace(/\*\*|`/g,'').replace(/^[-] /gm,'').trim(); }
function parse(md) {
  md=md.replace(/\r\n/g,"\n");
  return [...md.matchAll(/^### (\d+) · (.+)\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)].map(m=>{
    const body=m[3];
    const screen=body.match(/\*\*En pantalla[^\n]*\n([\s\S]*?)(?=\*\*Guion del expositor\*\*)/);
    if (!screen) throw new Error(`Falta contenido en pantalla: ${m[2]}`);
    const sections=[...md.slice(0,m.index).matchAll(/^## Sección \d+ · (.+)$/gm)];
    return {number:Number(m[1]), title:m[2], screen:screen[1].trim(), notes:body, section:sections.at(-1)?.[1]?.trim()??'ARKA-Lite'};
  });
}
function shape(slide,text,x,y,w,h,{size=28,fill='none',color=theme.ink,bold=false,geometry='textbox'}={}) {
  const s=slide.shapes.add({geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0,style:'solid'}});
  s.text=text.split('\n').map(line=>[{run:line,style:{typeface:theme.font}}]);
  s.text.style={fontFamily:theme.font,fontSize:size,color,bold};
  return s;
}
function graph(slide,key) {
  const d=diagrams[key];
  if(d.layout) {
    for(const zone of d.zones??[]) {
      // Transparent lanes keep native connectors visible in the renderer.
      shape(slide,zone.label,zone.box[0]+12,zone.box[1]+4,zone.box[2]-24,30,{size:18,bold:true,color:theme.blue});
    }
    const nodes=d.layout.map(n=>shape(slide,n.text,...n.box,{size:n.size??23,fill:n.core?theme.navy:theme.white,color:n.core?theme.white:theme.ink,bold:!!n.core,geometry:'rect'}));
    for(const edge of d.links??[]) {
      const [a,b,label,from='right',to='left']=edge;
      slide.shapes.connect(nodes[a],nodes[b],{kind:from==='right'&&to==='left'?'straight':'elbow',fromSide:from,toSide:to,line:{fill:theme.blue,width:2,style:'solid'},tail:{type:'arrow',width:'med',length:'med'}});
      if(label) {
        const ab=d.layout[a].box, bb=d.layout[b].box;
        const x=edge[5]??((ab[0]+ab[2]+bb[0])/2-65),y=edge[6]??(Math.min(ab[1],bb[1])-30);
        shape(slide,label,x,y,150,30,{size:17,color:theme.blue});
      }
    }
    shape(slide,d.caption,70,585,1140,66,{size:22,color:theme.muted});
    return;
  }
  const positions=d.nodes.length===3 ? [[70,300],[490,300],[910,300]] : [[70,210],[490,210],[910,210],[910,410],[490,410],[70,410]];
  const nodes=d.nodes.map((label,i)=>shape(slide,label,...positions[i],300,105,{size:25,fill:i===2?theme.navy:theme.pale,color:i===2?theme.white:theme.ink,geometry:'rect',bold:i===2}));
  const edges=d.edges??d.nodes.slice(1).map((_,i)=>[i,i+1]);
  for(const [a,b] of edges) {
    const [ax,ay]=positions[a], [bx,by]=positions[b];
    slide.shapes.connect(nodes[a],nodes[b],{kind:by!==ay&&bx!==ax?'elbow':'straight',fromSide:by>ay?'bottom':bx>ax?'right':'left',toSide:by>ay?'top':bx>ax?'left':'right',line:{fill:theme.blue,width:3,style:'solid'},tail:{type:'arrow',width:'med',length:'med'}});
  }
  shape(slide,d.caption,70,565,1135,80,{size:23,color:theme.muted});
}
function content(slide,screen) {
  const lines=screen.split(/\r?\n/);
  const tableLines=lines.filter(l=>l.startsWith('|')&&!/^\|[\s:|-]+\|$/.test(l));
  if(tableLines.length) {
    const values=tableLines.map(l=>l.split('|').slice(1,-1).map(plain));
    const table=slide.tables.add({rows:values.length,columns:values[0].length,left:70,top:205,width:1140,height:Math.min(415,values.length*76),values});
    for(let r=0;r<values.length;r++) for(let c=0;c<values[r].length;c++) {
      const cell=table.getCell(r,c);
      cell.value=[[{run:values[r][c],style:{typeface:theme.font}}]];
      cell.fill=r===0?theme.navy:r%2?theme.pale:theme.white;
      cell.text.style={fontFamily:theme.font,fontSize:24,color:r===0?theme.white:theme.ink,bold:r===0};
    }
    return;
  }
  const code=screen.match(/```\w*\n([\s\S]*?)```/);
  if(code) {
    const yaml=screen.includes('```yaml');
    shape(slide,code[1].trim(),70,205,yaml?725:1140,440,{size:25});
    if(yaml) {
      const explanations=code[1].includes('runs-on:')
        ? ['name: nombre visible en Actions','on: eventos que inician la ejecución','jobs: trabajo que GitHub ejecuta','runs-on: máquina del trabajo','permissions: alcance del token']
        : ['uses: ejecuta una acción reutilizable','with: configura esa acción','working-directory: carpeta del servicio','run: comando de shell en el runner'];
      explanations.forEach((line,i)=>shape(slide,line,835,215+i*78,375,72,{size:23,color:theme.blue}));
    }
    return;
  }
  const paragraphs=plain(screen).split(/\n\s*\n/);
  let y=215;
  for(const paragraph of paragraphs) {
    const rowLines=paragraph.split('\n');
    for(const line of rowLines) {
      const h=Math.max(62,Math.ceil(line.length/76)*42);
      if(y+h>650) throw new Error(`Contenido demasiado largo: ${line}`);
      shape(slide,line,70,y,1130,h,{size:30}); y+=h+12;
    }
  }
}

const manifest=[];
for(const name of ['equipo-desarrollo','staff-desarrollo']) {
  const md=await fs.readFile(path.join(root,`${name}.md`),'utf8');
  const slides=parse(md);
  if(!slides.length) throw new Error(`Sin láminas: ${name}`);
  const p=Presentation.create({slideSize:{width:1280,height:720}});
  const previews=path.join(build,name); await fs.mkdir(previews,{recursive:true});
  for(const item of slides) {
    const s=p.slides.add(); s.background.fill=theme.white;
    const section=item.section;
    shape(s,`${section.toUpperCase()}  /  ARKA-LITE`,70,35,1100,32,{size:18,color:theme.blue,bold:true});
    shape(s,item.title,70,92,1140,100,{size:43,bold:true,color:theme.navy});
    const key=diagramSlides[name][item.number];
    if(key) graph(s,key); else content(s,item.screen);
    shape(s,`${name==='equipo-desarrollo'?'Equipo de desarrollo':'Staff de desarrollo'}  ·  ${item.number} / ${slides.length}`,70,677,1140,25,{size:16,color:theme.muted});
    s.speakerNotes.text=plain(item.notes)+`\n\nFuentes: docs/presentation-data/ci-yaml-paso-a-paso.md; docs/presentation-data/flujo-y-referencias.md; docs/presentation-data/${name}.md; compose.yaml; k8s/*.yaml; .github/workflows/ci.yml; servicio-solicitudes/Dockerfile. Fragmentos didácticos y propuestas identificados en el guion.\nReferencias oficiales: https://docs.docker.com/build/building/multi-stage/ ; https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ ; https://docs.github.com/en/actions/get-started/understand-github-actions ; https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F`;
    const png=await p.export({slide:s,format:'png',scale:1});
    await fs.writeFile(path.join(previews,`${String(item.number).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
  }
  const candidate=path.join(build,`${name}.pptx`);
  await (await PresentationFile.exportPptx(p)).save(candidate);
  const skill=process.env.ARKA_PRESENTATIONS_SKILL;
  if(!skill || !process.env.ARKA_PYTHON) throw new Error('Faltan rutas del validador; usar generar-ppt.ps1');
  const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
  const finalPath=path.join(output,`${name}.pptx`);
  await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath,pythonExecutable:process.env.ARKA_PYTHON,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:[theme.font]},verifyArtifactToolImport:true,receiptPath:path.join(build,`${name}.validation.json`)});
  manifest.push({name,slides:slides.length,file:finalPath,previews});
}
await fs.writeFile(path.join(root,'.build','latest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest,null,2));
