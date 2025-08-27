(function(){
  const N8N_WEBHOOK = "https://sikkina.app.n8n.cloud/webhook/b6770bea-e920-4f5c-9ad0-aa8dee4411e2/chat"; 
  const root = document.getElementById('chat-root');

  root.innerHTML = `
    <button class="cb-btn" aria-label="Open chat">💬</button>
    <div class="cb-panel">
      <div class="cb-header">
        <div style="width:10px;height:10px;border-radius:50%;background:#22c55e"></div>
        <h3>Chat with us</h3>
      </div>
      <div class="cb-body" id="cb-body"></div>
      <div class="cb-input">
        <input id="cb-input" type="text" placeholder="Type your message…" />
        <button id="cb-send">Send</button>
      </div>
    </div>
  `;

  const btn = root.querySelector('.cb-btn');
  const panel = root.querySelector('.cb-panel');
  const body = root.querySelector('#cb-body');
  const input = root.querySelector('#cb-input');
  const send = root.querySelector('#cb-send');

  let sessionId = localStorage.getItem('cb_session') 
    || (Date.now().toString(36) + Math.random().toString(36).slice(2));
  localStorage.setItem('cb_session', sessionId);

  btn.addEventListener('click', () => {
    const vis = getComputedStyle(panel).display !== 'none';
    panel.style.display = vis ? 'none' : 'block';
    if (!vis) input.focus();
  });

  async function sendMessage(text){
    if(!text.trim()) return;
    render('user', text);
    input.value = '';

    const typing = render('bot', '…', true);

    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
      });
      const data = await res.json();
      typing.textContent = data.reply || data.text || '(No reply)';
      typing.classList.remove('cb-typing');
    } catch (e){
      typing.textContent = 'Error: please try again.';
      typing.classList.remove('cb-typing');
      console.error(e);
    }
  }

  function render(role, text, typing=false){
    const div = document.createElement('div');
    div.className = `cb-msg ${role==='user' ? 'cb-user':'cb-bot'} ${typing?'cb-typing':''}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

input.addEventListener('keydown', e => {
  if(e.key === 'Enter') sendMessage(input.value);
});

  send.addEventListener('click', () => sendMessage(input.value));
})();
