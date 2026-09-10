const API_BASE = `${window.location.origin}/api`;
let adminKey = '';

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('services-grid')) {
    loadPublicServices();
    loadPublicProjects();
    setupContactForm();
  }
});

// --- PUBLIC LANDING PAGE ---

async function loadPublicServices() {
  const grid = document.getElementById('services-grid');
  try {
    const res = await fetch(`${API_BASE}/services`);
    const services = await res.json();

    if (!Array.isArray(services) || services.length === 0) {
      grid.innerHTML = '<p>No services added yet. Add from Admin panel.</p>';
      return;
    }

    grid.innerHTML = services.map(s => `
      <div class="card">
        ${s.imageUrl ? `<img src="${s.imageUrl}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">` : ''}
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <span class="tag">${s.category || 'Service'}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>Error loading services.</p>';
  }
}

async function loadPublicProjects() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();

    if (!Array.isArray(projects) || projects.length === 0) {
      grid.innerHTML = '<p>No projects showcased yet.</p>';
      return;
    }

    grid.innerHTML = projects.map(p => `
      <div class="card">
        ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">` : ''}
        <h3>${p.title}</h3>
        <p><strong>Tech:</strong> ${p.techStack}</p>
        <span class="tag">${p.category}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>Error loading projects.</p>';
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-response');

  if (!form) return;

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
      } else {
        throw new Error();
      }
    } catch (err) {
      status.innerText = 'Failed to send message. Please check MongoDB connection.';
      status.style.color = 'red';
    }
  });
}

// --- ADMIN DASHBOARD ---

function loginAdmin() {
  adminKey = document.getElementById('admin-passkey').value;
  if (!adminKey) return alert('Enter Passkey');

  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');

  loadAdminServices();
  loadAdminProjects();
  loadAdminInquiries();
  setupAdminForms();
}

async function loadAdminServices() {
  const list = document.getElementById('admin-services-list');
  try {
    const res = await fetch(`${API_BASE}/services`);
    const data = await res.json();
    list.innerHTML = data.map(s => `
      <div class="item-row">
        <span><strong>${s.title}</strong> (${s.category})</span>
        <button class="btn-del" onclick="deleteService('${s._id}')">Delete</button>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p>Failed to load services.</p>';
  }
}

async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  await fetch(`${API_BASE}/services/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey }
  });
  loadAdminServices();
}

async function loadAdminProjects() {
  const list = document.getElementById('admin-projects-list');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();
    list.innerHTML = data.map(p => `
      <div class="item-row">
        <span><strong>${p.title}</strong></span>
        <button class="btn-del" onclick="deleteProject('${p._id}')">Delete</button>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p>Failed to load projects.</p>';
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey }
  });
  loadAdminProjects();
}

async function loadAdminInquiries() {
  const list = document.getElementById('admin-inquiries-list');
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { 'x-admin-key': adminKey }
    });

    if (!res.ok) {
      list.innerHTML = '<p style="color:red;">Invalid Passkey / Unauthorized</p>';
      return;
    }

    const data = await res.json();
    if (data.length === 0) {
      list.innerHTML = '<p>No messages received yet.</p>';
      return;
    }

    list.innerHTML = data.map(i => `
      <div class="card" style="margin-bottom:10px; border:1px solid #cbd5e1; padding:12px;">
        <strong>${i.name}</strong> (${i.email}) <br>
        <small><strong>Category:</strong> ${i.projectType}</small>
        <p style="margin-top:5px;">${i.message}</p>
        <small style="color:gray;">${new Date(i.createdAt).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p>Failed to load inquiries.</p>';
  }
}

function setupAdminForms() {
  const sForm = document.getElementById('add-service-form');
  if (sForm) {
    sForm.onsubmit = async (e) => {
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
      sForm.reset();
      loadAdminServices();
    };
  }

  const pForm = document.getElementById('add-project-form');
  if (pForm) {
    pForm.onsubmit = async (e) => {
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
      pForm.reset();
      loadAdminProjects();
    };
  }
}