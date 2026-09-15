(()=>{'use strict';
const FONTS=[
  {name:'马善政',family:'Ma Shan Zheng',css:'https://cdnjs.cloudflare.com/ajax/libs/fontsource-ma-shan-zheng/5.3.1/chinese-simplified.css'},
  {name:'龙藏',family:'Long Cang',css:'https://cdnjs.cloudflare.com/ajax/libs/fontsource-long-cang/5.3.0/chinese-simplified.css'},
  {name:'志莽星',family:'Zhi Mang Xing',css:'https://cdnjs.cloudflare.com/ajax/libs/fontsource-zhi-mang-xing/5.3.0/chinese-simplified.css'}
];
let fontLoadPromise=null;
function loadFonts(){
  if(fontLoadPromise)return fontLoadPromise;
  fontLoadPromise=(async()=>{
    await Promise.all(FONTS.map(f=>new Promise(resolve=>{
      const existing=document.querySelector(`link[data-hand-font="${f.family}"]`);
      if(existing){resolve();return;}
      const link=document.createElement('link');
      link.rel='stylesheet';link.href=f.css;link.dataset.handFont=f.family;
      link.onload=()=>resolve();link.onerror=()=>resolve();
      document.head.appendChild(link);
    })));
    if(document.fonts?.load){
      await Promise.all(FONTS.map(f=>document.fonts.load(`28px "${f.family}"`,'示例医生').catch(()=>[])));
    }
  })();
  return fontLoadPromise;
}
function findSign(){return document.querySelector('#paper .node[data-id="sign"]')}
function cleanName(text){const t=(text||'').trim();return t.replace(/^签名\s*[:：]?\s*/,'').trim()||'示例医生'}
function styleSign(el,family='Ma Shan Zheng',size=28,angle=-2,spacing=0){
  if(!el)return;
  el.classList.add('hand-sign-target');
  el.style.fontFamily=`"${family}", "KaiTi", "STKaiti", cursive`;
  el.style.fontSize=`${size}px`;
  el.style.transform=`rotate(${angle}deg)`;
  el.style.letterSpacing=`${spacing}px`;
  el.dataset.handwritingSignature='1';
}
async function applyDefault(el=findSign()){
  if(!el)return;
  await loadFonts();
  styleSign(el);
  if(document.fonts?.load)await document.fonts.load('28px "Ma Shan Zheng"','示例医生').catch(()=>[]);
}
function ensureModal(){
  if(document.getElementById('sigModal'))return;
  const m=document.createElement('div');m.id='sigModal';m.className='modal';
  m.innerHTML='<div class="card" style="width:min(520px,94vw)"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3 style="margin:0">手写签名（演示）</h3><button class="mini" id="sigClose">关闭</button></div><div class="sub" style="margin:6px 0 12px">仅改变演示模板中的签名字体，不生成或冒充真实医生签名。</div><div class="pg"><div class="full"><label>签名文字<input id="sigText" value="示例医生"></label></div><div><label>手写字体<select id="sigFont"></select></label></div><div><label>字号<input id="sigSize" type="number" min="10" max="96" value="28"></label></div><div><label>倾斜角度<input id="sigAngle" type="number" min="-15" max="15" step="0.5" value="-2"></label></div><div><label>字间距<input id="sigSpacing" type="number" min="-3" max="12" step="0.5" value="0"></label></div><div class="full"><div id="sigPreview" style="padding:18px;border:1px dashed #cfd5dc;border-radius:7px;background:#fafbfc;text-align:center;font-size:30px;min-height:76px">示例医生</div></div></div><div class="bar" style="margin-top:12px"><button class="mini" id="sigApply">应用到签名字段</button><button class="mini" id="sigReset">恢复默认</button></div><div class="note" style="margin-top:12px">手写字体通过 CDN 加载；当前为界面/排版演示。</div></div>';
  document.body.appendChild(m);
  const sel=m.querySelector('#sigFont');FONTS.forEach((f,i)=>{const o=document.createElement('option');o.value=f.family;o.textContent=f.name;if(i===0)o.selected=true;sel.appendChild(o)});
  const controls=['sigText','sigFont','sigSize','sigAngle','sigSpacing'];
  const updatePreview=()=>{const p=m.querySelector('#sigPreview');const text=m.querySelector('#sigText').value||'示例医生';const family=m.querySelector('#sigFont').value;p.textContent=text;p.style.fontFamily=`"${family}", "KaiTi", "STKaiti", cursive`;p.style.fontSize=(+m.querySelector('#sigSize').value||28)+'px';p.style.transform='rotate('+(+m.querySelector('#sigAngle').value||0)+'deg)';p.style.letterSpacing=(+m.querySelector('#sigSpacing').value||0)+'px'};
  controls.forEach(id=>m.querySelector('#'+id).addEventListener('input',updatePreview));
  m.querySelector('#sigClose').onclick=()=>m.classList.remove('show');
  m.querySelector('#sigReset').onclick=()=>{m.querySelector('#sigText').value='示例医生';m.querySelector('#sigFont').value=FONTS[0].family;m.querySelector('#sigSize').value=28;m.querySelector('#sigAngle').value=-2;m.querySelector('#sigSpacing').value=0;updatePreview()};
  m.querySelector('#sigApply').onclick=async()=>{const el=findSign();if(!el){alert('当前模板没有签名字段，请先选择亚健康复诊模板。');return}await loadFonts();const text=m.querySelector('#sigText').value.trim()||'示例医生';const family=m.querySelector('#sigFont').value;styleSign(el,family,+m.querySelector('#sigSize').value||28,+m.querySelector('#sigAngle').value||0,+m.querySelector('#sigSpacing').value||0);el.textContent='签名： '+text;if(document.fonts?.load)await document.fonts.load(`${el.style.fontSize} "${family}"`,text).catch(()=>[]);m.classList.remove('show');document.getElementById('saveState')&&(document.getElementById('saveState').textContent='● 已修改');};
  updatePreview();
}
function addButton(){
  const top=document.querySelector('.top');if(!top||document.getElementById('handSignBtn'))return;
  const b=document.createElement('button');b.className='tb';b.id='handSignBtn';b.textContent='✍ 手写签名';b.title='为当前演示模板的签名字段选择中文手写字体';
  b.onclick=async()=>{await loadFonts();ensureModal();const el=findSign();const m=document.getElementById('sigModal');if(el){document.getElementById('sigText').value=cleanName(el.textContent);const fam=el.style.fontFamily;document.getElementById('sigFont').value=FONTS.find(f=>fam.includes(f.family))?.family||FONTS[0].family;document.getElementById('sigSize').value=parseInt(el.style.fontSize)||28;const rr=el.style.transform.match(/rotate\(([-\d.]+)deg\)/);document.getElementById('sigAngle').value=rr?parseFloat(rr[1]):-2;document.getElementById('sigSpacing').value=parseFloat(el.style.letterSpacing)||0;document.getElementById('sigPreview').textContent=cleanName(el.textContent)}m.classList.add('show')};
  const printBtn=document.getElementById('print');(printBtn?.parentElement||top).insertBefore(b,printBtn||null);
}
function observePaper(){
  const paper=document.getElementById('paper');if(!paper)return;
  const ensure=()=>{const el=findSign();if(el&&el.dataset.handwritingSignature!=='1')applyDefault(el)};
  ensure();
  new MutationObserver(()=>{ensure()}).observe(paper,{childList:true,subtree:true});
}
function boot(){addButton();ensureModal();observePaper();applyDefault()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
