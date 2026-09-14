(()=>{'use strict';
const STYLE_ID='handwriting-signature-style';
const FONTS=[
  {name:'马善政',family:'Ma Shan Zheng',url:'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap'},
  {name:'龙藏',family:'Long Cang',url:'https://fonts.googleapis.com/css2?family=Long+Cang&display=swap'},
  {name:'志莽星',family:'Zhi+Mang+Xing',url:'https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap'}
];
function loadFonts(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent=`@import url('${FONTS[0].url}');@import url('${FONTS[1].url}');@import url('https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap');\n.hand-sign-target{font-variant-ligatures:none!important;text-rendering:geometricPrecision!important}`;
  document.head.appendChild(s);
}
function findSign(){return document.querySelector('#paper .node[data-id="sign"]')}
function cleanName(text){const t=(text||'').trim();return t.replace(/^签名\s*[:：]?\s*/,'').trim()||'示例医生'}
function ensureModal(){
  if(document.getElementById('sigModal'))return;
  const m=document.createElement('div');m.id='sigModal';m.className='modal';
  m.innerHTML='<div class="card" style="width:min(520px,94vw)"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3 style="margin:0">手写签名（演示）</h3><button class="mini" id="sigClose">关闭</button></div><div class="sub" style="margin:6px 0 12px">仅改变演示模板中的签名字体，不生成或冒充真实医生签名。</div><div class="pg"><div class="full"><label>签名文字<input id="sigText" value="示例医生"></label></div><div><label>手写字体<select id="sigFont"></select></label></div><div><label>字号<input id="sigSize" type="number" min="10" max="96" value="28"></label></div><div><label>倾斜角度<input id="sigAngle" type="number" min="-15" max="15" step="0.5" value="-2"></label></div><div><label>字间距<input id="sigSpacing" type="number" min="-3" max="12" step="0.5" value="0"></label></div><div class="full"><div id="sigPreview" style="padding:18px;border:1px dashed #cfd5dc;border-radius:7px;background:#fafbfc;text-align:center;font-size:30px;min-height:76px">示例医生</div></div></div><div class="bar" style="margin-top:12px"><button class="mini" id="sigApply">应用到签名字段</button><button class="mini" id="sigReset">恢复默认</button></div><div class="note" style="margin-top:12px">字体来自 Google Fonts 的开源中文手写字型。网络不可用时会自动回退到系统手写/楷体字体。</div></div>';
  document.body.appendChild(m);
  const sel=m.querySelector('#sigFont');FONTS.forEach((f,i)=>{const o=document.createElement('option');o.value=f.family;o.textContent=f.name; if(i===0)o.selected=true;sel.appendChild(o)});
  const controls=['sigText','sigFont','sigSize','sigAngle','sigSpacing'];
  const updatePreview=()=>{const p=m.querySelector('#sigPreview');const text=m.querySelector('#sigText').value||'示例医生';const family=m.querySelector('#sigFont').value;p.textContent=text;p.style.fontFamily='"'+family+'", "KaiTi", "STKaiti", cursive';p.style.fontSize=(+m.querySelector('#sigSize').value||28)+'px';p.style.transform='rotate('+(+m.querySelector('#sigAngle').value||0)+'deg)';p.style.letterSpacing=(+m.querySelector('#sigSpacing').value||0)+'px'};
  controls.forEach(id=>m.querySelector('#'+id).addEventListener('input',updatePreview));m.querySelector('#sigClose').onclick=()=>m.classList.remove('show');
  m.querySelector('#sigReset').onclick=()=>{m.querySelector('#sigText').value='示例医生';m.querySelector('#sigFont').value=FONTS[0].family;m.querySelector('#sigSize').value=28;m.querySelector('#sigAngle').value=-2;m.querySelector('#sigSpacing').value=0;updatePreview()};
  m.querySelector('#sigApply').onclick=()=>{const el=findSign();if(!el){alert('当前模板没有签名字段，请先选择亚健康复诊模板。');return}const text=m.querySelector('#sigText').value.trim()||'示例医生';const family=m.querySelector('#sigFont').value;el.textContent='签名： '+text;el.classList.add('hand-sign-target');el.style.fontFamily='"'+family+'", "KaiTi", "STKaiti", cursive';el.style.fontSize=(+m.querySelector('#sigSize').value||28)+'px';el.style.transform='rotate('+(+m.querySelector('#sigAngle').value||0)+'deg)';el.style.letterSpacing=(+m.querySelector('#sigSpacing').value||0)+'px';el.dataset.handwritingSignature='1';m.classList.remove('show');document.getElementById('saveState')&&(document.getElementById('saveState').textContent='● 已修改');};
  updatePreview();
}
function addButton(){
  const top=document.querySelector('.top');if(!top||document.getElementById('handSignBtn'))return;
  const b=document.createElement('button');b.className='tb';b.id='handSignBtn';b.textContent='✍ 手写签名';b.title='为当前演示模板的签名字段选择中文手写字体';
  b.onclick=()=>{loadFonts();ensureModal();const el=findSign();const m=document.getElementById('sigModal');if(el){document.getElementById('sigText').value=cleanName(el.textContent);document.getElementById('sigFont').value=el.style.fontFamily.match(/"([^"]+)"/)?.[1]||FONTS[0].family;document.getElementById('sigSize').value=parseInt(el.style.fontSize)||28;document.getElementById('sigAngle').value=parseFloat((el.style.transform.match(/rotate\(([-\d.]+)deg\)/)||[])[1])||-2;document.getElementById('sigSpacing').value=parseFloat(el.style.letterSpacing)||0;document.getElementById('sigPreview').textContent=cleanName(el.textContent)}m.classList.add('show')};
  const printBtn=document.getElementById('print');(printBtn?.parentElement||top).insertBefore(b,printBtn||null);
}
function autoApplyDefault(){
  const el=findSign();if(!el||el.dataset.handwritingSignature==='1')return;
  loadFonts();el.classList.add('hand-sign-target');el.style.fontFamily='"Ma Shan Zheng", "KaiTi", "STKaiti", cursive';el.style.fontSize='28px';el.style.transform='rotate(-2deg)';el.style.letterSpacing='0px';el.dataset.handwritingSignature='1';
}
function boot(){addButton();autoApplyDefault();const obs=new MutationObserver(()=>{addButton();autoApplyDefault()});obs.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
