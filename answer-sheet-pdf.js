(function(global){
  'use strict';

  // US Letter landscape - designed so all 7 rounds fit on two pages maximum.
  const PAGE_W = 792;
  const PAGE_H = 612;
  const MARGIN = 28;
  const GAP = 14;
  const CARD_W = (PAGE_W - (MARGIN*2) - GAP) / 2;
  const CARD_H = 224;

  function asciiText(value='') {
    return String(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[\u2018\u2019]/g,"'")
      .replace(/[\u201C\u201D]/g,'"')
      .replace(/[\u2013\u2014]/g,'-')
      .replace(/[^\x20-\x7E]/g,'');
  }
  function pdfEscape(value='') {
    return asciiText(value).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  }
  function cleanFileName(value='trivia-night') {
    return asciiText(value).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase() || 'trivia-night';
  }
  function hexRgb(hex, fallback='#36a8f5') {
    const match = /^#([0-9a-f]{6})$/i.exec(hex || '') || /^#([0-9a-f]{6})$/i.exec(fallback);
    const n = parseInt(match[1],16);
    return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];
  }
  function fmt(n){ return Number(n.toFixed(3)); }
  function rgbCmd(rgb, stroke=false){ return `${fmt(rgb[0])} ${fmt(rgb[1])} ${fmt(rgb[2])} ${stroke?'RG':'rg'}\n`; }
  function textCmd(x,y,size,text,font='F1',rgb=[0.06,0.16,0.33]) {
    return `${rgbCmd(rgb)}BT /${font} ${fmt(size)} Tf 1 0 0 1 ${fmt(x)} ${fmt(y)} Tm (${pdfEscape(text)}) Tj ET\n`;
  }
  function approxWidth(text,size,bold=false){ return asciiText(text).length * size * (bold ? 0.56 : 0.52); }
  function fitSize(text,maxSize,minSize,maxWidth,bold=true){
    let size=maxSize;
    while(size>minSize && approxWidth(text,size,bold)>maxWidth) size-=0.5;
    return size;
  }
  function circlePath(cx,cy,r){
    const k=0.5522847498*r;
    return `${fmt(cx+r)} ${fmt(cy)} m\n${fmt(cx+r)} ${fmt(cy+k)} ${fmt(cx+k)} ${fmt(cy+r)} ${fmt(cx)} ${fmt(cy+r)} c\n${fmt(cx-k)} ${fmt(cy+r)} ${fmt(cx-r)} ${fmt(cy+k)} ${fmt(cx-r)} ${fmt(cy)} c\n${fmt(cx-r)} ${fmt(cy-k)} ${fmt(cx-k)} ${fmt(cy-r)} ${fmt(cx)} ${fmt(cy-r)} c\n${fmt(cx+k)} ${fmt(cy-r)} ${fmt(cx+r)} ${fmt(cy-k)} ${fmt(cx+r)} ${fmt(cy)} c\nh\n`;
  }
  function roundedRect(x,y,w,h,r){
    const k=0.5522847498*r;
    return `${fmt(x+r)} ${fmt(y)} m\n${fmt(x+w-r)} ${fmt(y)} l\n${fmt(x+w-r+k)} ${fmt(y)} ${fmt(x+w)} ${fmt(y+r-k)} ${fmt(x+w)} ${fmt(y+r)} c\n${fmt(x+w)} ${fmt(y+h-r)} l\n${fmt(x+w)} ${fmt(y+h-r+k)} ${fmt(x+w-r+k)} ${fmt(y+h)} ${fmt(x+w-r)} ${fmt(y+h)} c\n${fmt(x+r)} ${fmt(y+h)} l\n${fmt(x+r-k)} ${fmt(y+h)} ${fmt(x)} ${fmt(y+h-r+k)} ${fmt(x)} ${fmt(y+h-r)} c\n${fmt(x)} ${fmt(y+r)} l\n${fmt(x)} ${fmt(y+r-k)} ${fmt(x+r-k)} ${fmt(y)} ${fmt(x+r)} ${fmt(y)} c\nh\n`;
  }

  function pageHeader(game,pageNum){
    const navy=[0.06,0.16,0.33], muted=[0.35,0.43,0.55], teal=[0.03,0.70,0.64], white=[1,1,1], cream=[1,0.985,0.95];
    const title=asciiText(game.title || 'Trivia Night') || 'Trivia Night';
    let s='';
    s += rgbCmd(cream) + `0 0 ${PAGE_W} ${PAGE_H} re f\n`;
    s += rgbCmd(navy) + `0 564 ${PAGE_W} 48 re f\n`;
    s += textCmd(30,581,17,'TRIVIA NIGHT - ANSWER SHEET','F2',white);
    const titleSize=fitSize(title,15,9,310,true);
    s += textCmd(456,581,titleSize,title,'F2',white);
    s += textCmd(30,539,10,'TEAM NAME:','F2',navy);
    s += rgbCmd([0.62,0.68,0.76],true) + '1 w 103 537 m 463 537 l S\n';
    s += textCmd(637,539,9,`PAGE ${pageNum} OF 2`,'F2',muted);
    s += textCmd(704,539,9,'70 QUESTIONS','F2',teal);
    return s;
  }

  function answerRow(x,y,w,number,accent){
    const navy=[0.06,0.16,0.33], white=[1,1,1], line=[0.78,0.83,0.88];
    let s='';
    const cy=y+7;
    s += rgbCmd(accent) + circlePath(x+10,cy,7) + 'f\n';
    const num=String(number), fs=number===10?6.2:7.4;
    s += textCmd(x+10-approxWidth(num,fs,true)/2,cy-2.6,fs,num,'F2',white);
    s += rgbCmd(line,true) + `0.75 w ${fmt(x+23)} ${fmt(y+2)} m ${fmt(x+w-4)} ${fmt(y+2)} l S\n`;
    return s;
  }

  function categoryCard(category,index,x,y){
    const navy=[0.06,0.16,0.33], muted=[0.35,0.43,0.55], white=[1,1,1], border=[0.82,0.87,0.92];
    const accent=hexRgb(category.color || '#36a8f5');
    const name=asciiText(category.name || `Category ${index+1}`) || `Category ${index+1}`;
    const music=category.type==='music';
    let s='';
    s += rgbCmd(white) + roundedRect(x,y,CARD_W,CARD_H,12) + 'f\n';
    s += rgbCmd(border,true) + '1 w ' + roundedRect(x,y,CARD_W,CARD_H,12) + 'S\n';
    s += rgbCmd(accent) + `${fmt(x)} ${fmt(y+CARD_H-36)} ${fmt(CARD_W)} 36 re f\n`;
    s += textCmd(x+14,y+CARD_H-23,8.5,`ROUND ${index+1}`,'F2',white);
    const size=fitSize(name.toUpperCase(),14,8.5,CARD_W-104,true);
    const tw=approxWidth(name.toUpperCase(),size,true);
    s += textCmd(x+CARD_W-14-tw,y+CARD_H-25,size,name.toUpperCase(),'F2',white);
    s += textCmd(x+14,y+CARD_H-50,7.5,music?'MUSIC ROUND':'TRIVIA ROUND','F2',muted);
    const firstY=y+CARD_H-68;
    for(let i=0;i<10;i++) s += answerRow(x+15, firstY-(i*16), CARD_W-30, i+1, accent);
    return s;
  }

  function bonusCard(game,x,y){
    const navy=[0.06,0.16,0.33], muted=[0.35,0.43,0.55], white=[1,1,1], border=[0.88,0.78,0.43], accent=[0.95,0.64,0.11];
    let s='';
    s += rgbCmd(white) + roundedRect(x,y,CARD_W,CARD_H,12) + 'f\n';
    s += rgbCmd(border,true) + '1 w ' + roundedRect(x,y,CARD_W,CARD_H,12) + 'S\n';
    s += rgbCmd(accent) + `${fmt(x)} ${fmt(y+CARD_H-36)} ${fmt(CARD_W)} 36 re f\n`;
    s += textCmd(x+14,y+CARD_H-23,9,'FINAL ROUND','F2',navy);
    s += textCmd(x+CARD_W-111,y+CARD_H-25,14,'BONUS','F2',navy);
    s += textCmd(x+14,y+CARD_H-58,8,'ONE FINAL ANSWER','F2',muted);
    s += rgbCmd(accent) + circlePath(x+26,y+105,11) + 'f\n';
    s += textCmd(x+22.8,y+101.5,9,'1','F2',white);
    s += rgbCmd([0.78,0.83,0.88],true) + `1 w ${fmt(x+48)} ${fmt(y+96)} m ${fmt(x+CARD_W-20)} ${fmt(y+96)} l S\n`;
    s += textCmd(x+14,y+55,8,'Use this space for the final bonus answer.','F1',muted);
    s += textCmd(x+14,y+34,8,'Pass your paper when the host calls for it.','F1',muted);
    return s;
  }

  function notesCard(x,y){
    const navy=[0.06,0.16,0.33], muted=[0.35,0.43,0.55], white=[1,1,1], border=[0.82,0.87,0.92];
    let s='';
    s += rgbCmd(white) + roundedRect(x,y,CARD_W,CARD_H,12) + 'f\n';
    s += rgbCmd(border,true) + '1 w ' + roundedRect(x,y,CARD_W,CARD_H,12) + 'S\n';
    s += textCmd(x+14,y+CARD_H-27,13,'NOTES / TIEBREAKER','F2',navy);
    s += textCmd(x+14,y+CARD_H-49,8,'Extra space if the host needs it.','F1',muted);
    for(let i=0;i<7;i++){ const ly=y+145-(i*20); s += rgbCmd([0.80,0.84,0.89],true) + `0.7 w ${fmt(x+14)} ${fmt(ly)} m ${fmt(x+CARD_W-14)} ${fmt(ly)} l S\n`; }
    return s;
  }

  function pageCommands(game,pageNum){
    let s=pageHeader(game,pageNum);
    const x1=MARGIN, x2=MARGIN+CARD_W+GAP;
    const yTop=298, yBottom=60;
    const indices=pageNum===1?[0,1,2,3]:[4,5,6];
    if(pageNum===1){
      s += categoryCard(game.categories[0],0,x1,yTop);
      s += categoryCard(game.categories[1],1,x2,yTop);
      s += categoryCard(game.categories[2],2,x1,yBottom);
      s += categoryCard(game.categories[3],3,x2,yBottom);
    } else {
      s += categoryCard(game.categories[4],4,x1,yTop);
      s += categoryCard(game.categories[5],5,x2,yTop);
      s += categoryCard(game.categories[6],6,x1,yBottom);
      s += (game.bonus && game.bonus.enabled) ? bonusCard(game,x2,yBottom) : notesCard(x2,yBottom);
    }
    return s;
  }

  function buildPdf(game){
    if(!game || !Array.isArray(game.categories) || game.categories.length!==7) throw new Error('A valid Trivia Night game is required.');
    const count=2;
    const font1=7;
    const font2=8;
    const objects=[];
    objects[1]='<< /Type /Catalog /Pages 2 0 R >>';
    objects[2]='<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>';
    for(let i=0;i<count;i++){
      const pageObj=3+i*2, contentObj=pageObj+1;
      const stream=pageCommands(game,i+1);
      const streamBytes=new TextEncoder().encode(stream);
      objects[pageObj]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentObj} 0 R >>`;
      objects[contentObj]=`<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream`;
    }
    objects[font1]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    objects[font2]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

    const encoder=new TextEncoder();
    const chunks=[]; let offset=0;
    function push(str){ const b=encoder.encode(str); chunks.push(b); offset+=b.length; }
    push('%PDF-1.4\n%TRIVIA\n');
    const offsets=[0];
    for(let i=1;i<objects.length;i++){ offsets[i]=offset; push(`${i} 0 obj\n${objects[i]}\nendobj\n`); }
    const xref=offset;
    push(`xref\n0 ${objects.length}\n`); push('0000000000 65535 f \n');
    for(let i=1;i<objects.length;i++) push(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
    push(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    const out=new Uint8Array(offset); let cursor=0;
    for(const c of chunks){ out.set(c,cursor); cursor+=c.length; }
    return out;
  }

  function download(game){
    const bytes=buildPdf(game);
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`${cleanFileName(game.title)}-answer-sheet.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  global.TriviaAnswerSheets={buildPdf,download};
})(typeof window!=='undefined'?window:globalThis);
