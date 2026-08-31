(function(global){
  'use strict';
  const PDF_W=792, PDF_H=612, SCALE=2, W=PDF_W*SCALE, H=PDF_H*SCALE;
  const M=44, GAP=24, HEADER_H=94, CARD_GAP=18;
  const CARD_W=(W-M*2-GAP)/2;
  const CARD_H=(H-HEADER_H-M-CARD_GAP)/2;

  function cleanFileName(value='trivia-night'){
    return String(value||'trivia-night').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'trivia-night';
  }
  function roundRect(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function fitText(ctx,text,maxWidth,start=30,min=16,weight=800){
    let size=start; const family='Inter, Arial, sans-serif';
    while(size>min){ ctx.font=`${weight} ${size}px ${family}`; if(ctx.measureText(text).width<=maxWidth) return size; size-=1; }
    return min;
  }
  function drawCenteredWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){
    const words=String(text).split(/\s+/); const lines=[]; let line='';
    for(const word of words){ const test=line?`${line} ${word}`:word; if(ctx.measureText(test).width>maxWidth && line){ lines.push(line); line=word; } else line=test; }
    if(line) lines.push(line);
    const shown=lines.slice(0,maxLines); shown.forEach((ln,i)=>ctx.fillText(ln,x,y+(i-(shown.length-1)/2)*lineHeight));
  }
  function color(hex,fallback='#36a8f5'){ return /^#[0-9a-f]{6}$/i.test(hex||'')?hex:fallback; }
  function drawPageHeader(ctx,game,page){
    ctx.fillStyle='#fffaf0'; ctx.fillRect(0,0,W,H);
    const title=String(game.title||'Trivia Night');
    const titleMax=Math.min(W*0.46,720);
    const fs=fitText(ctx,title,titleMax,30,18,900);
    ctx.textBaseline='middle'; ctx.fillStyle='#102a56';
    ctx.font=`900 ${fs}px Inter, Arial, sans-serif`;
    ctx.textAlign='right';
    ctx.fillText(title,W-M,31);
    if(page===1){
      ctx.textAlign='left';
      ctx.font='900 18px Inter, Arial, sans-serif';
      ctx.fillText('TEAM NAME:',M,70);
      ctx.strokeStyle='#9eacbd'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(M+125,71); ctx.lineTo(W*0.52,71); ctx.stroke();
    }
  }
  function drawAnswerRows(ctx,x,y,w,h,accent){
    const top=y+102, bottom=y+h-20, rowH=(bottom-top)/10;
    for(let i=0;i<10;i++){
      const cy=top+rowH*i+rowH/2;
      ctx.fillStyle=accent; ctx.beginPath(); ctx.arc(x+31,cy,15,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`900 ${i===9?14:16}px Inter, Arial, sans-serif`; ctx.fillText(String(i+1),x+31,cy+1);
      ctx.strokeStyle='#bac8d5'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(x+58,cy+7); ctx.lineTo(x+w-22,cy+7); ctx.stroke();
    }
  }
  function drawCategoryCard(ctx,cat,index,x,y){
    const accent=color(cat.color, '#36a8f5');
    ctx.fillStyle='#fff'; roundRect(ctx,x,y,CARD_W,CARD_H,20); ctx.fill(); ctx.strokeStyle='#cfdce7'; ctx.lineWidth=2; ctx.stroke();
    ctx.save(); roundRect(ctx,x,y,CARD_W,CARD_H,20); ctx.clip(); ctx.fillStyle=accent; ctx.fillRect(x,y,CARD_W,70); ctx.restore();
    ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.font='900 17px Inter, Arial, sans-serif'; ctx.fillText(`ROUND ${index+1}`,x+20,y+35);
    ctx.font='32px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.fillText(cat.icon||'❓',x+122,y+35);
    const name=String(cat.name||`Category ${index+1}`).toUpperCase(); const titleX=x+170, max=CARD_W-190; const fs=fitText(ctx,name,max,27,16,900); ctx.font=`900 ${fs}px Inter, Arial, sans-serif`; ctx.textAlign='right';
    if(ctx.measureText(name).width<=max){ ctx.fillText(name,x+CARD_W-20,y+35); }
    else { ctx.textAlign='center'; ctx.font=`900 16px Inter, Arial, sans-serif`; drawCenteredWrapped(ctx,name,titleX+max/2,y+35,max,18,2); }
    ctx.textAlign='left'; ctx.fillStyle='#697a96'; ctx.font='900 13px Inter, Arial, sans-serif';
    const label=cat.type==='music'?'MUSIC ROUND':cat.type==='picture'?'PICTURE ROUND':'TRIVIA ROUND'; ctx.fillText(label,x+20,y+88);
    drawAnswerRows(ctx,x,y,CARD_W,CARD_H,accent);
  }
  function drawStar(ctx,cx,cy,outer=11,inner=5.2,fill='#f2a31c'){
    ctx.save(); ctx.beginPath();
    for(let i=0;i<10;i++){
      const r=i%2===0?outer:inner;
      const a=-Math.PI/2+i*Math.PI/5;
      const px=cx+Math.cos(a)*r, py=cy+Math.sin(a)*r;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.restore();
  }

  function drawBonusCard(ctx,bonus,x,y){
    const accent='#f2a31c';
    ctx.fillStyle='#fff'; roundRect(ctx,x,y,CARD_W,CARD_H,20); ctx.fill(); ctx.strokeStyle='#e8d38d'; ctx.lineWidth=2; ctx.stroke();
    ctx.save(); roundRect(ctx,x,y,CARD_W,CARD_H,20); ctx.clip(); ctx.fillStyle='#ffbf2f'; ctx.fillRect(x,y,CARD_W,70); ctx.restore();
    ctx.fillStyle='#102a56'; ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.font='900 17px Inter, Arial, sans-serif'; ctx.fillText('FINAL ROUND',x+20,y+35);
    drawStar(ctx,x+151,y+35,10.5,5,'#f2a31c');
    const name=String(bonus?.name||'Bonus Round').toUpperCase(); const fs=fitText(ctx,name,CARD_W-205,27,16,900); ctx.font=`900 ${fs}px Inter, Arial, sans-serif`; ctx.textAlign='right'; ctx.fillText(name,x+CARD_W-20,y+35);
    ctx.textAlign='left'; ctx.fillStyle='#697a96'; ctx.font='900 13px Inter, Arial, sans-serif'; ctx.fillText('ONE FINAL ANSWER',x+20,y+91);
    const cy=y+155; ctx.fillStyle=accent; ctx.beginPath(); ctx.arc(x+33,cy,18,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='900 18px Inter, Arial, sans-serif'; ctx.fillText('1',x+33,cy+1);
    ctx.strokeStyle='#b8c6d4'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+66,cy+12); ctx.lineTo(x+CARD_W-24,cy+12); ctx.stroke();
    ctx.textAlign='left'; ctx.fillStyle='#697a96'; ctx.font='700 13px Inter, Arial, sans-serif'; ctx.fillText('Use this space for the final bonus answer.',x+20,y+220);
  }
  function drawNotesCard(ctx,x,y){
    ctx.fillStyle='#fff'; roundRect(ctx,x,y,CARD_W,CARD_H,20); ctx.fill(); ctx.strokeStyle='#cfdce7'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#102a56'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.font='900 24px Inter, Arial, sans-serif'; ctx.fillText('NOTES / TIEBREAKER',x+20,y+38);
    ctx.fillStyle='#697a96'; ctx.font='700 13px Inter, Arial, sans-serif'; ctx.fillText('Extra space if the host needs it.',x+20,y+66);
    for(let i=0;i<8;i++){ const ly=y+105+i*34; ctx.strokeStyle='#c3cfda'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x+20,ly); ctx.lineTo(x+CARD_W-20,ly); ctx.stroke(); }
  }
  function pageCanvas(game,page){
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; const ctx=canvas.getContext('2d');
    drawPageHeader(ctx,game,page);
    const x1=M, x2=M+CARD_W+GAP, y1=HEADER_H, y2=HEADER_H+CARD_H+CARD_GAP;
    if(page===1){ drawCategoryCard(ctx,game.categories[0],0,x1,y1); drawCategoryCard(ctx,game.categories[1],1,x2,y1); drawCategoryCard(ctx,game.categories[2],2,x1,y2); drawCategoryCard(ctx,game.categories[3],3,x2,y2); }
    else { drawCategoryCard(ctx,game.categories[4],4,x1,y1); drawCategoryCard(ctx,game.categories[5],5,x2,y1); drawCategoryCard(ctx,game.categories[6],6,x1,y2); if(game.bonus?.enabled) drawBonusCard(ctx,game.bonus,x2,y2); else drawNotesCard(ctx,x2,y2); }
    return canvas;
  }
  function dataUrlBytes(url){ const base64=url.split(',')[1]; const bin=atob(base64); const out=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i); return out; }
  function buildPdfFromJpegs(images){
    const enc=new TextEncoder(), chunks=[]; let offset=0; const offsets=[0];
    function pushText(t){ const b=enc.encode(t); chunks.push(b); offset+=b.length; }
    function pushBytes(b){ chunks.push(b); offset+=b.length; }
    function objText(n,body){ offsets[n]=offset; pushText(`${n} 0 obj\n${body}\nendobj\n`); }
    function objImage(n,img){ offsets[n]=offset; pushText(`${n} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`); pushBytes(img); pushText(`\nendstream\nendobj\n`); }
    pushText('%PDF-1.4\n%TRIVIA\n');
    objText(1,'<< /Type /Catalog /Pages 2 0 R >>');
    objText(2,'<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>');
    objText(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>');
    objImage(4,images[0]);
    const c1='q 792 0 0 612 0 0 cm /Im1 Do Q'; objText(5,`<< /Length ${c1.length} >>\nstream\n${c1}\nendstream`);
    objText(6,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /XObject << /Im2 7 0 R >> >> /Contents 8 0 R >>');
    objImage(7,images[1]);
    const c2='q 792 0 0 612 0 0 cm /Im2 Do Q'; objText(8,`<< /Length ${c2.length} >>\nstream\n${c2}\nendstream`);
    const xref=offset; pushText('xref\n0 9\n0000000000 65535 f \n'); for(let i=1;i<=8;i++) pushText(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`); pushText(`trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    const out=new Uint8Array(offset); let pos=0; for(const c of chunks){out.set(c,pos);pos+=c.length;} return out;
  }
  async function buildPdf(game){
    if(!game || !Array.isArray(game.categories) || game.categories.length!==7) throw new Error('A valid Trivia Night game is required.');
    if(document.fonts?.ready) try{ await document.fonts.ready; }catch{}
    const jpegs=[1,2].map(page=>dataUrlBytes(pageCanvas(game,page).toDataURL('image/jpeg',.94)));
    return buildPdfFromJpegs(jpegs);
  }
  async function download(game){
    const bytes=await buildPdf(game); const blob=new Blob([bytes],{type:'application/pdf'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${cleanFileName(game.title)}-answer-sheet.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  global.TriviaAnswerSheets={buildPdf,download};
})(typeof window!=='undefined'?window:globalThis);
