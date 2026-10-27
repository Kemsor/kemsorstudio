import { createConnection } from 'node:net';

const endpoint='http://127.0.0.1:2525/api/email/send';
const fail=(code,responseCode)=>Object.assign(new Error('GoDaddy email gateway request failed'),{code,responseCode});

// The gateway is local to GoDaddy's app container. Never take its URL from a form.
export async function sendEmail({to,subject,text},request=globalThis.fetch) {
  let response,body;
  try {
    response=await request(endpoint,{
      method:'POST',headers:{'Content-Type':'application/json'},
      // This app's original platform sender delivered successfully before domain attachment.
      // Keep it literal so forms cannot override the sender or follow domain changes.
      body:JSON.stringify({to:[to],subject,text,from:'sxqc7mdcy1@airoapp.ai',replyTo:'info@kemsorstudio.com'}),
      signal:AbortSignal.timeout(30000)
    });
    body=await response.json();
  }catch(error){
    throw fail(['AbortError','TimeoutError'].includes(error?.name)?'GATEWAY_TIMEOUT':'GATEWAY_CONNECTION');
  }
  if(!response.ok || body?.success!==true)throw fail('GATEWAY_REJECTED',response.status);
  if(typeof body.messageId!=='string' || !body.messageId)throw fail('GATEWAY_RESPONSE');
  return {messageId:body.messageId};
}

// A TCP probe checks availability without sending a message or inventing a health API.
export function verifyGateway() {
  return new Promise((resolve,reject)=>{
    const socket=createConnection({host:'127.0.0.1',port:2525});
    let finished=false;
    const finish=(error)=>{
      if(finished)return;finished=true;socket.destroy();
      if(error)reject(fail('GATEWAY_CONNECTION'));else resolve(true);
    };
    socket.setTimeout(5000,()=>finish(new Error('timeout')));
    socket.once('error',finish);socket.once('connect',()=>finish());
  });
}

export function gatewayTransport() {
  return {sendMail:message=>sendEmail(message),verify:verifyGateway,close(){}};
}
