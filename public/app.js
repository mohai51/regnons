const API_BASE = '/api';
let adminKey = '';

// Load data when on Landing Page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('services-grid')) {
    loadPublicServices();
    loadPublicProjects();
    setupContactForm();
  }
});

// --- PUBLIC LANDING PAGE LOGIC ---

async function loadPublicServices() {
  const grid = document.getElementById('services-grid');
  try {
    const res = await fetch(`${API_BASE}/services`);
    const services = await res.json();

    if (services.length === 0) {
      grid.innerHTML = '<p>No services listed yet.</p>';
      return;
    }

    grid.innerHTML = services.map(s => `
      <div class="card">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <span class="tag">${s.category || 'Service'}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>Failed to load services.</p>';
  }
}

async function loadPublicProjects() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();

    if (projects.length === 0) {
      grid.innerHTML = '<p>No projects showcased yet.</p>';
      return;
    }

    grid.innerHTML = projects.map(p => `
      <div class="card">
        <h3>${p.title}</h3>
        <p><strong>Tech Stack:</strong> ${p.techStack}</p>
        <span class="tag">${p.category}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p>Failed to load projects.</p>';
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
        status.innerText = 'Thank you! Your message has been sent.';
        status.style.color = 'green';
        form.reset();
      } else {
        throw new Error();
      }
    } catch (err) {
      status.innerText = 'Failed to send message. Please try again.';
      status.style.color = 'red';
    }
  });
}

// --- ADMIN DASHBOARD LOGIC ---

function loginAdmin() {
  const input = document.getElementById('admin-passkey').value;
  if (!input) return alert('Please enter passkey');
  
  adminKey = input;
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');

  loadAdminData();
  setupAdminForms();
}

async function loadAdminData() {
  loadAdminServices();
  loadAdminProjects();
  loadAdminInquiries();
}

async function loadAdminServices() {
  const list = document.getElementById('admin-services-list');
  const res = await fetch(`${API_BASE}/services`);
  const data = await res.json();

  list.innerHTML = data.map(s => `
    <div class="list-item">
      <span><strong>${s.title}</strong> (${s.category})</span>
      <button class="btn-delete" onclick="deleteService('${s._id}')">Delete</button>
    </div>
  `).join('');
}

async function deleteService(id) {
  if (!confirm('Are you sure?')) return;
  await fetch(`${API_BASE}/services/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey }
  });
  loadAdminServices();
}

async function loadAdminProjects() {
  const list = document.getElementById('admin-projects-list');
  const res = await fetch(`${API_BASE}/projects`);
  const data = await res.json();

  list.innerHTML = data.map(p => `
    <div class="list-item">
      <span><strong>${p.title}</strong> - ${p.techStack}</span>
      <button class="btn-delete" onclick="deleteProject('${p._id}')">Delete</button>
    </div>
  `).join('');
}

async function deleteProject(id) {
  if (!confirm('Are you sure?')) return;
  await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey }
  });
  loadAdminProjects();
}

async function loadAdminInquiries() {
  const list = document.getElementById('admin-inquiries-list');
  const res = await fetch(`${API_BASE}/inquiries`, {
    headers: { 'x-admin-key': adminKey }
  });
  if (!res.ok) {
    list.innerHTML = '<p>Unauthorized or failed to load inquiries.</p>';
    return;
  }
  const data = await res.json();

  if (data.length === 0) {
    list.innerHTML = '<p>No customer messages received yet.</p>';
    return;
  }

  list.innerHTML = data.map(i => `
    <div class="card" style="margin-bottom: 12px;">
      <h4>${i.name} (${i.email})</h4>
      <p><strong>Type:</strong> ${i.projectType}</p>
      <p style="margin-top: 5px;">${i.message}</p>
      <small style="color: var(--text-muted);">${new Date(i.createdAt).toLocaleString()}</small>
    </div>
  `).join('');
}

function setupAdminForms() {
  // Service Form Submit
  document.getElementById('add-service-form').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('service-title').value,
      category: document.getElementById('service-category').value,
      description: document.getElementById('service-desc').value
    };

    await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-key': adminKey 
      },
      body: JSON.stringify(payload)
    });

    e.target.reset();
    loadAdminServices();
  };

  // Project Form Submit
  document.getElementById('add-project-form').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('project-title').value,
      techStack: document.getElementById('project-tech').value,
      category: document.getElementById('project-category').value
    };

    await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-key': adminKey 
      },
      body: JSON.stringify(payload)
    });

    e.target.reset();
    loadAdminProjects();
  };
}