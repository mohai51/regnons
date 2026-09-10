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
      grid.innerHTML = '<p>No services added yet.</p>';
      return;
    }

    grid.innerHTML = services.map(s => `
      <div class="card">
        ${s.imageUrl ? `<div class="card-img-wrapper"><img src="${s.imageUrl}" alt="${s.title}" class="card-img" onerror="this.style.display='none'"></div>` : ''}
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <span class="tag">${s.category || 'Service'}</span>
        ${s.externalLink ? `<a href="${s.externalLink}" target="_blank" class="btn-secondary" style="display:inline-block; margin-top:12px; font-size:14px; text-decoration:none;">Explore →</a>` : ''}
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
        ${p.imageUrl ? `<div class="card-img-wrapper"><img src="${p.imageUrl}" alt="${p.title}" class="card-img" onerror="this.style.display='none'"></div>` : ''}
        <h3>${p.title}</h3>
        <p><strong>Tech:</strong> ${p.techStack}</p>
        <span class="tag">${p.category}</span>
        ${p.externalLink ? `<a href="${p.externalLink}" target="_blank" class="btn-primary" style="display:inline-block; margin-top:12px; font-size:14px; text-decoration:none;">Explore Project →</a>` : ''}
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
      <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:8px; background:#f8fafc; border-radius:6px;">
        <span><strong>${s.title}</strong> (${s.category})</span>
        <div>
          <button onclick="openEditModal('service', '${s._id}', '${encodeURIComponent(s.title)}', '${encodeURIComponent(s.description || '')}', '${encodeURIComponent(s.imageUrl || '')}', '${encodeURIComponent(s.externalLink || '')}', '${encodeURIComponent(s.category || '')}')" style="margin-right:5px; background:#3b82f6; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
          <button class="btn-del" onclick="deleteService('${s._id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
        </div>
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
      <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:8px; background:#f8fafc; border-radius:6px;">
        <span><strong>${p.title}</strong></span>
        <div>
          <button onclick="openEditModal('project', '${p._id}', '${encodeURIComponent(p.title)}', '${encodeURIComponent(p.techStack || '')}', '${encodeURIComponent(p.imageUrl || '')}', '${encodeURIComponent(p.externalLink || '')}', '${encodeURIComponent(p.category || '')}')" style="margin-right:5px; background:#3b82f6; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
          <button class="btn-del" onclick="deleteProject('${p._id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
        </div>
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
          imageUrl: document.getElementById('service-img').value,
          externalLink: document.getElementById('service-link') ? document.getElementById('service-link').value : ''
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
          imageUrl: document.getElementById('project-img').value,
          externalLink: document.getElementById('project-link') ? document.getElementById('project-link').value : ''
        })
      });
      pForm.reset();
      loadAdminProjects();
    };
  }
}

// --- EDIT MODAL LOGIC ---

function openEditModal(type, id, title, desc, img, link, category) {
  document.getElementById('edit-type').value = type;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-title').value = decodeURIComponent(title);
  document.getElementById('edit-desc').value = decodeURIComponent(desc);
  document.getElementById('edit-img').value = decodeURIComponent(img);
  document.getElementById('edit-link').value = decodeURIComponent(link);
  if (document.getElementById('edit-category')) {
    document.getElementById('edit-category').value = decodeURIComponent(category);
  }
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

async function saveEdit() {
  const type = document.getElementById('edit-type').value;
  const id = document.getElementById('edit-id').value;

  const payload = {
    title: document.getElementById('edit-title').value,
    imageUrl: document.getElementById('edit-img').value,
    externalLink: document.getElementById('edit-link').value
  };

  if (document.getElementById('edit-category')) {
    payload.category = document.getElementById('edit-category').value;
  }

  if (type === 'service') {
    payload.description = document.getElementById('edit-desc').value;
  } else {
    payload.techStack = document.getElementById('edit-desc').value;
  }

  try {
    const res = await fetch(`${API_BASE}/${type}s/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'x-admin-key': adminKey 
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeEditModal();
      if (type === 'service') loadAdminServices();
      else loadAdminProjects();
    } else {
      alert('Failed to update item. Check backend response.');
    }
  } catch (err) {
    alert('Error updating item.');
  }
}