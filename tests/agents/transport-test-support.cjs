const SCHEMA_GUARD = `
function strictSchema(node, root=true) {
 if(!node || typeof node!=='object' || ['allOf','if','then','else','not','patternProperties'].some(key=>key in node))throw Error('schema incompativel');
 if(root && node.type!=='object')throw Error('raiz invalida');
 if(node.type==='object'){
  if(node.additionalProperties!==false || !node.properties || !Array.isArray(node.required) || JSON.stringify(Object.keys(node.properties).sort())!==JSON.stringify([...node.required].sort()))throw Error('objeto aberto ou propriedade opcional');
  Object.values(node.properties).forEach(child=>strictSchema(child,false));
 }
 if(node.type==='array'){if(!node.items)throw Error('items ausente');strictSchema(node.items,false);}
 if(node.anyOf)node.anyOf.forEach(child=>strictSchema(child,false));
}
function transportOutput(output) {
 const wire=JSON.parse(JSON.stringify(output));
 if(wire.agent==='content_curator') {
  if(!wire.proposal)wire.proposal=null;
  else {if(wire.proposal.questionPt===undefined)wire.proposal.questionPt=null;wire.proposal.wrongExplanations[String(wire.proposal.correctIndex)]=null;}
 }
 return wire;
}
`;
module.exports = { SCHEMA_GUARD };
