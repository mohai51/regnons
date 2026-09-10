const API_BASE = '/api';
let adminKey = '';

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('services-grid')) {
    loadPublicServices();
    loadPublicProjects();
    setupContactForm();
  }
});

async function loadPublicServices() {
  const grid = document.getElementById('services-grid');
  try {
    const res = await fetch(`${API_BASE}/services`);
    const services = await res.json();
    grid.innerHTML = services.map(s => `
      <div class="card">
        ${s.imageUrl ? `<img src="${s.imageUrl}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">` : ''}
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <span class="tag">${s.category}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>No services found.</p>';
  }
}

async function loadPublicProjects() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();
    grid.innerHTML = projects.map(p => `
      <div class="card">
        ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">` : ''}
        <h3>${p.title}</h3>
        <p><strong>Tech:</strong> ${p.techStack}</p>
        <span class="tag">${p.category}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>No projects found.</p>';
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-response');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.innerText = 'Sending...';

    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      projectType: document.getElementById('projectType').value,
      message: document.getElementById('message').value
    };

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        status.innerText = 'Message sent successfully!';
        status.style.color = 'green';
        form.reset();
      }
    } catch (err) {
      status.innerText = 'Failed to send message.';
      status.style.color = 'red';
    }
  });
}

function loginAdmin() {
  adminKey = document.getElementById('admin-passkey').value;
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');
  loadAdminData();
  setupAdminForms();
}

function loadAdminData() {
  loadAdminServices();
  loadAdminProjects();
  loadAdminInquiries();
}

async function loadAdminServices() {
  const list = document.getElementById('admin-services-list');
  const res = await fetch(`${API_BASE}/services`);
  const data = await res.json();
  list.innerHTML = data.map(s => `
    <div class="item-row">
      <span>${s.title}</span>
      <button class="btn-del" onclick="deleteService('${s._id}')">Delete</button>
    </div>
  `).join('');
}

async function deleteService(id) {
  await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
  loadAdminServices();
}

async function loadAdminProjects() {
  const list = document.getElementById('admin-projects-list');
  const res = await fetch(`${API_BASE}/projects`);
  const data = await res.json();
  list.innerHTML = data.map(p => `
    <div class="item-row">
      <span>${p.title}</span>
      <button class="btn-del" onclick="deleteProject('${p._id}')">Delete</button>
    </div>
  `).join('');
}

async function deleteProject(id) {
  await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
  loadAdminProjects();
}

async function loadAdminInquiries() {
  const list = document.getElementById('admin-inquiries-list');
  const res = await fetch(`${API_BASE}/inquiries`, { headers: { 'x-admin-key': adminKey } });
  const data = await res.json();
  list.innerHTML = data.map(i => `
    <div class="card" style="margin-bottom: 10px;">
      <strong>${i.name}</strong> (${i.email}) - <em>${i.projectType}</em>
      <p>${i.message}</p>
    </div>
  `).join('');
}

function setupAdminForms() {
  document.getElementById('add-service-form').onsubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({
        title: document.getElementById('service-title').value,
        category: document.getElementById('service-category').value,
        description: document.getElementById('service-desc').value,
        imageUrl: document.getElementById('service-img').value
      })
    });
    e.target.reset();
    loadAdminServices();
  };

  document.getElementById('add-project-form').onsubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({
        title: document.getElementById('project-title').value,
        techStack: document.getElementById('project-tech').value,
        category: document.getElementById('project-category').value,
        imageUrl: document.getElementById('project-img').value
      })
    });
    e.target.reset();
    loadAdminProjects();
  };
}