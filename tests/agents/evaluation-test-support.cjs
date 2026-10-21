const fs = require('node:fs');
const path = require('node:path');
const { DISABLED_FEATURES } = require('../../scripts/agent-auth.cjs');
const { SCHEMA_GUARD } = require('./transport-test-support.cjs');

const GOOD_CODE = `module.exports = function summarizeResponses(items) {
  if (!Array.isArray(items) || items.some(item => !item || Array.isArray(item) || typeof item.correct !== 'boolean')) throw new TypeError('Entrada invalida');
  const correct = items.filter(item => item.correct).length;
  return { total: items.length, correct, points: correct * 5, percent: items.length ? Math.round(correct * 100 / items.length) : 0 };
};\n`;
const GOOD_DOCUMENTATION = `Execução
Uso local: node exemplo.cjs --entrada respostas.json --saida resultado.json
Não requer rede. Não requer credenciais.
Regras
total conta as respostas; correct conta os acertos. O percentual inteiro é arredondado.
points = correct * 5
percent = total === 0 ? 0 : Math.round(correct * 100 / total)
\`\`\`json
{"input":[{"correct":true},{"correct":false}],"output":{"total":2,"correct":1,"points":5,"percent":50}}
\`\`\`
Falhas
Entrada vazia produz zeros. Entrada inválida causa TypeError.
`;
function fakeCli(directory, root, mode = 'ok') {
  const target = path.join(directory, `codex-evaluation-${mode}.cjs`);
  const hostPath = path.join(directory, 'codex-code-mode-host');
  if (mode === 'no-host' && fs.existsSync(hostPath)) fs.unlinkSync(hostPath);
  if (mode !== 'no-host')
    fs.writeFileSync(hostPath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  const record = path.join(directory, 'fake-calls.jsonl');
  const cases = JSON.parse(
    fs.readFileSync(
      path.join(root, 'tests/fixtures/agent-evaluation/editorial-cases.json'),
    ),
  ).cases;
  const v2Cases = JSON.parse(
    fs.readFileSync(
      path.join(root, 'config/agent-evaluation-benchmark-v2.json'),
    ),
  ).cases;
  const program = `#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const args=process.argv.slice(2), mode=${JSON.stringify(mode)};
${SCHEMA_GUARD}
if(args[0]==='--version'){console.log('codex-cli 0.160.0');process.exit(0);}
if(args[0]==='login'){console.log('Logged in using ChatGPT');process.exit(mode==='no-login'?1:0);}
if(args[0]==='features'){for(const name of ${JSON.stringify(DISABLED_FEATURES)})console.log(name+' stable false');console.log('skip_host_skill_discovery beta true');process.exit(0);}
if(args[0]==='mcp'){console.log('[]');process.exit(0);}
if(args[0]==='debug' && args[1]==='prompt-input'){console.log(JSON.stringify([{type:'message',role:'developer',content:[{text:'Contexto ficticio sem skills.'}]}]));process.exit(0);}
if(args[0]==='debug'){console.log(JSON.stringify({models:['gpt-5.6-sol','gpt-6.1-sol','gpt-6-luna','gpt-5.6-terra'].filter(slug=>mode!=='no-model'||slug!=='gpt-6-luna').map(slug=>({slug}))}));process.exit(0);}
if(args[0]==='sandbox'){
 if(mode==='sandbox-failed')process.exit(71);
 const data=JSON.parse(args.at(-1));
 if(Array.isArray(data)){const checks=Object.fromEntries(data.map(([name,,,allowed])=>[name,allowed?'allowed':'denied']));checks.network='denied';console.log(JSON.stringify(checks));process.exit(0);}
 const index=args.indexOf('-e');
 const result=cp.spawnSync(process.execPath,['-e',args[index+1],args.at(-1)],{cwd:process.cwd(),encoding:'utf8'});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');process.exit(result.status||0);
}
if(args[0]!=='exec')process.exit(2);
if(args.includes('--output-schema'))strictSchema(JSON.parse(fs.readFileSync(args[args.indexOf('--output-schema')+1],'utf8')));
const prompt=fs.readFileSync(0,'utf8');
fs.appendFileSync(${JSON.stringify(record)},JSON.stringify({model:args[args.indexOf('--model')+1],cwd:process.cwd(),args,apiKey:process.env.OPENAI_API_KEY||null,hasOracle:fs.existsSync('config/agent-evaluation-plan.json')||fs.existsSync('scripts/agent-evaluation-grading.cjs')})+'\\n');
console.log(JSON.stringify({type:'thread.started',thread_id:'fixture-thread'}));
if(mode==='startup-warnings'){
 const {startupMessages}=require(${JSON.stringify(path.join(root, 'scripts/agent-cli-events.cjs'))});
 for(const [index,message] of startupMessages(process.env.CODEX_HOME).entries())console.log(JSON.stringify({type:'item.completed',item:{id:'warn_'+index,type:'error',message}}));
}
console.log(JSON.stringify({type:'turn.started'}));
console.log(JSON.stringify({type:'item.updated',item:{id:'plan_0',type:'todo_list',items:[{text:'Conferir fonte.',completed:true}]}}));
if(mode==='unknown-event')console.log(JSON.stringify({type:'item.completed',item:{id:'future_0',type:'future_metadata'}}));
if(mode==='forbidden-tool')console.log(JSON.stringify({type:'item.completed',item:{id:'tool_0',type:'web_search'}}));
if(mode==='failed-remote'){console.log(JSON.stringify({type:'error',message:'modelo indisponivel no teste'}));process.exit(1);}
const start=prompt.lastIndexOf('Entrada autorizada:\\n');
if(start>=0){
 const document=JSON.parse(prompt.slice(start+'Entrada autorizada:\\n'.length));const input=document.input;
 let output={agent:input.requestedPass==='curation'?'content_curator':'pedagogical_quality',workItemId:input.workItemId,contentSetId:input.contentSetId,subjectId:input.subjectId,topicId:input.topicId,reviewPass:input.requestedPass,decision:'approved',facts:['Fonte sintetica fornecida.'],doubts:[],findings:[],recommendations:['Manter aprovacao humana pendente.'],humanApprovalRequired:true};
 if(input.requestedPass==='curation'){
  const match=prompt.match(/EVAL-CUR-(\\d)/);const second=match&&match[1]==='2';const answer=second?'are':'is';
  output.proposal={schemaVersion:'content-v1',id:'EVAL-CUR-'+(second?'2':'1'),contentSetId:input.contentSetId,subject:input.subjectId,topic:input.topicId,skill:input.authorizedSkill,version:input.questionVersion,sourceRef:input.sourceRef,reviewStatus:'draft',question:second?'Complete: They ___ playing in the park.':'Complete: She ___ reading a book.',questionPt:second?'Complete: Eles ___ brincando no parque.':'Complete: Ela ___ lendo um livro.',options:second?['are','is','am','be']:['is','are','am','be'],correctIndex:0,explanation:second?'Com they, usamos are para uma acao em andamento.':'Com she, usamos is para uma acao em andamento.',wrongExplanations:{'1':'Essa forma nao acompanha o sujeito desta frase.','2':'Am acompanha I, nao o sujeito desta frase.','3':'Be nao e a forma conjugada pedida nesta frase.'}};
  if(mode==='rejected-curation'){output.decision='blocked';output.findings=[{questionId:'EVAL-CUR-WRONG',criterion:'apoio-generico',severity:'blocking',evidence:'A evidencia foi associada ao identificador errado.',recommendation:'Usar o ID da proposta.'}];}
 }else{
  const expected=(input.workItemId.startsWith('v2-')?${JSON.stringify(v2Cases)}:${JSON.stringify(cases)}).find(item=>item.proposal.id===input.proposal.id);
  if(expected.kind==='invalid' && mode!=='missed'){
   output.decision='blocked';output.findings=[{questionId:input.proposal.id,criterion:expected.expectedCriterion,severity:'blocking',evidence:JSON.stringify(input.proposal),recommendation:'Corrigir o defeito sintetico identificado.'}];
  }
 }
 fs.writeFileSync(args[args.indexOf('--output-last-message')+1],JSON.stringify(transportOutput(output)));
}else if(prompt.includes('verificador analitico independente')){
 fs.writeFileSync(args[args.indexOf('--output-last-message')+1],JSON.stringify({decision:'adjustments_required',findings:[{requirementId:'VER-EMPTY',severity:'blocking',evidence:'reduce sem valor inicial falha quando a lista esta vazia.'}],facts:['Os testes fornecidos nao cobrem lista vazia.'],limitations:['Analise baseada nas evidencias fornecidas.']}));
}else{
 const marker='Ficha integral:\\n';const from=prompt.indexOf(marker)+marker.length;const tail=prompt.slice(from);const end=tail.indexOf('\\n\\n');const work=JSON.parse(end<0?tail:tail.slice(0,end));
 const file=work.allowedPaths[0];
 if(file.endsWith('.cjs'))fs.writeFileSync(file,mode==='bad-code'?'module.exports = () => ({total:0,correct:0,points:0,percent:0});':${JSON.stringify(GOOD_CODE)});
 else fs.writeFileSync(file,${JSON.stringify(GOOD_DOCUMENTATION)});
 console.log(JSON.stringify({type:'item.completed',item:{id:'file_0',type:'file_change'}}));
}
console.log(JSON.stringify({type:'item.completed',item:{id:'message_0',type:'agent_message',text:'Resposta concluida.'}}));
console.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:120,cached_input_tokens:10,output_tokens:30}}));
`;
  fs.writeFileSync(target, program, { mode: 0o755 });
  return { bin: target, record };
}
module.exports = { fakeCli, GOOD_CODE, GOOD_DOCUMENTATION };
