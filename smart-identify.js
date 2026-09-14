(()=>{'use strict';
const byId=id=>document.getElementById(id);
const FONT='SimSun,"宋体","NSimSun","新宋体",serif';
const ALIASES={姓名:['姓名','患者姓名','病人姓名','名字'],性别:['性别'],年龄:['年龄'],身份证号:['身份证','身份证号','证件号'],联系电话:['电话','手机号','联系电话','联系方式'],科室:['科室','就诊科室'],床位:['床位'],住院号:['住院号'],门诊号:['门诊号'],影像号:['影像号','检查号'],就诊日期:['就诊日期','就诊时间','看诊日期'],检查日期:['检查日期','检查时间'],报告日期:['报告日期','报告时间'],首次就诊日期:['首次就诊日期','初诊日期'],复诊日期:['复诊日期','随访日期'],主诉:['主诉','主要症状','症状'],持续时间:['持续时间','病程'],现病史:['现病史','病情经过'],既往史:['既往史'],过敏史:['过敏史','药物过敏'],家族史:['家族史'],检查所见:['检查所见','影像表现','超声所见','所见'],检查结果:['检查结果','检查结论','检验结果'],诊断:['诊断','初步诊断','临床诊断','医生评估','评估/诊断'],处理意见:['处理意见','处理方式','治疗方案','处置'],用药:['用药','用药情况','药物治疗'],医生建议:['医生建议','建议','注意事项'],复诊时间:['复诊时间','建议复诊时间','下次复诊'],备注:['备注','说明']};
function canon(k){k=k.trim().replace(/[：:]/g,'');for(const [c,a] of Object.entries(ALIASES))if(c===k||a.includes(k))return c;return null}
function parse(text){const out=[],seen=new Set(),add=(f,v)=>{v=String(v).trim();if(v&&!seen.has(f)&&v.length<=1500){seen.add(f);out.push({field:f,value:v})}};
 const lines=text.split(/\r?\n|[；;]/).map(x=>x.trim()).filter(Boolean), all=lines.join('\n');
 for(const line of lines){const m=line.match(/^([^：:]{1,14})\s*[：:]\s*(.+)$/);if(m){const c=canon(m[1]);if(c){add(c,m[2]);continue}}
  const ga=line.match(/^(男|女|男性|女性)\s*[，,、]\s*(\d{1,3})\s*岁?$/);if(ga){add('性别',ga[1]);add('年龄',ga[2]+'岁');continue}
  const d=line.match(/(20\d{2}[年\/-]\d{1,2}[月\/-]\d{1,2}日?)/);if(d&&/日期|时间|就诊|检查|报告|复诊|随访/.test(line)){add(/报告/.test(line)?'报告日期':/检查/.test(line)?'检查日期':/复诊|随访/.test(line)?'复诊日期':'就诊日期',d[1]);}
  const ph=line.match(/(?<!\d)(1[3-9]\d{9})(?!\d)/);if(ph&&/电话|手机|联系/.test(line))add('联系电话',ph[1]);
 }
 if(!seen.has('性别')){const g=all.match(/(?:^|[\s，,])([男女])(?:性)?(?:[\s，,。]|$)/);if(g)add('性别',g[1])}
 if(!seen.has('年龄')){const a=all.match(/(\d{1,3})\s*岁/);if(a)add('年龄',a[1]+'岁')}
 return out;
}
function findNode(field){const as=[field,...(ALIASES[field]||[])];return [...document.querySelectorAll('#paper .node')].find(e=>{const t=(e.innerText||'').trim();return as.some(a=>t.startsWith(a+'：')||t.startsWith(a+':')||t.startsWith(a+' '))})}
function render(results){const box=byId('smartResult');if(!results.length){box.innerHTML='<span style="color:#9b7000">没有识别到明确字段。建议使用“字段名：内容”的写法。</span>';return}box.innerHTML=results.map((r,i)=>`<div class="smart-row"><b>${i+1}. ${esc(r.field)}</b><span>${esc(r.value)}</span><span class="smart-tag ${findNode(r.field)?'ok':'new'}">${findNode(r.field)?'可匹配':'未匹配'}</span></div>`).join('')}
function esc(v){return String(v).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function apply(results){const matched=[],unmatched=[];for(const r of results){const e=findNode(r.field);if(e)matched.push([e,r]);else unmatched.push(r)}
 if(!matched.length){toast('没有与当前模板匹配的字段');return}
 matched.forEach(([e,r])=>{const label=ALIASES[r.field]?.[0]||r.field,sep=e.innerText.includes('：')?'：':e.innerText.includes(':')?':':'：';e.innerText=label+sep+r.value;e.dispatchEvent(new Event('input',{bubbles:true}))});
 byId('check')?.click();byId('save')?.click();toast(`已填入 ${matched.length} 个字段${unmatched.length?`，${unmatched.length} 个未匹配`:''}`);render(results)}
function toast(m){let t=byId('smartToast');if(!t){t=document.createElement('div');t.id='smartToast';t.style='position:fixed;right:18px;bottom:18px;background:#20252b;color:#fff;padding:9px 12px;border-radius:7px;z-index:9999';document.body.appendChild(t)}t.textContent=m;clearTimeout(t._tm);t._tm=setTimeout(()=>t.remove(),1700)}
function open(){byId('smartModal').classList.add('show');byId('smartInput').focus()}
function boot(){if(byId('smart'))return;const style=document.createElement('style');style.textContent='.smart-row{display:grid;grid-template-columns:120px 1fr 62px;gap:8px;padding:6px 0;border-bottom:1px solid #eee;align-items:center}.smart-tag{font-size:10px;text-align:center;padding:2px 5px;border-radius:9px;background:#eef4ff;color:#3e6aa9}.smart-tag.new{background:#fff6e5;color:#9b7000}#smartModal .card{max-height:88vh;overflow:auto}';document.head.appendChild(style);
 const check=byId('check');if(!check)return;const btn=document.createElement('button');btn.className='tb';btn.id='smart';btn.textContent='智能识别';check.parentNode.insertBefore(btn,check.nextSibling);btn.onclick=open;
 const m=document.createElement('div');m.className='modal';m.id='smartModal';m.innerHTML='<div class="card" style="width:min(900px,94vw)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b>智能识别字段</b><span class="status">自动识别常见字段并匹配当前模板</span></div><textarea id="smartInput" style="width:100%;height:260px;margin-top:10px" placeholder="姓名：王某某\n男，22岁\n科室：皮肤科\n检查日期：2026-09-14\n主诉：面部反复长痘半年\n现病史：近半年反复出现\n检查所见：面部可见红色丘疹\n诊断：……\n处理意见：……\n复诊时间：一周后"></textarea><div class="bar" style="margin-top:8px"><button class="mini" id="smartParse">开始识别</button><button class="mini" id="smartUse">一键填入已匹配字段</button><button class="mini" id="smartClear">清空</button><button class="mini" id="smartClose">关闭</button></div><div class="diag" id="smartResult" style="margin-top:10px;max-height:280px;overflow:auto">等待识别…</div><div class="note" style="margin-top:8px"><b>你需要提供：</b>最少只需粘贴原始文字；可选提供当前模板名称、特殊字段名称/别名。当前版本使用本地规则识别，不需要 API Key。未匹配字段不会强行塞进模板，避免破坏版式。</div></div>';document.body.appendChild(m);
 byId('smartClose').onclick=()=>m.classList.remove('show');byId('smartClear').onclick=()=>{byId('smartInput').value='';window.__smartResults=[];byId('smartResult').textContent='等待识别…'};byId('smartParse').onclick=()=>{window.__smartResults=parse(byId('smartInput').value);render(window.__smartResults)};byId('smartUse').onclick=()=>apply(window.__smartResults?.length?window.__smartResults:parse(byId('smartInput').value));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();