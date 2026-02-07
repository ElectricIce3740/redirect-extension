async function loadRules() {
  const rules = await browser.declarativeNetRequest.getDynamicRules();
  const list = document.getElementById('redirect-list');
  list.innerHTML = '';

  rules.forEach(rule => {
    const li = document.createElement('li');
    li.className = 'redirect-item';

    const info = document.createElement('span');
    info.textContent = `${rule.condition.urlFilter} -> ${rule.action.redirect.url}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => deleteRule(rule.id);

    li.appendChild(info);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

async function addRule() {
  const source = document.getElementById('source').value.trim();
  let destination = document.getElementById('destination').value.trim();

  if (!source || !destination) {
    alert('Please provide both source and destination.');
    return;
  }

  // Basic validation/fixing for destination URL
  if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
    destination = 'https://' + destination;
  }

  try {
    // Generate a unique integer ID >= 1
    // Date.now() is a large integer. We use it to avoid collisions.
    const ruleId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);

    const newRule = {
      id: ruleId,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: destination }
      },
      condition: {
        urlFilter: source,
        resourceTypes: ['main_frame']
      }
    };

    await browser.declarativeNetRequest.updateDynamicRules({
      addRules: [newRule]
    });

    // Clear inputs and reload
    document.getElementById('source').value = '';
    document.getElementById('destination').value = '';
    loadRules();
  } catch (error) {
    console.error('Error adding rule:', error);
    alert('Failed to add rule: ' + error.message);
  }
}

async function deleteRule(id) {
  try {
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [id]
    });
    loadRules();
  } catch (error) {
    console.error('Error deleting rule:', error);
    alert('Failed to delete rule: ' + error.message);
  }
}

document.getElementById('add-btn').addEventListener('click', addRule);
document.addEventListener('DOMContentLoaded', loadRules);
