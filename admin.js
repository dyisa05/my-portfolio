const API_BASE = '/api/admin';
let token = localStorage.getItem('adminToken');

if (!token) {
  window.location.href = '/admin-login.html';
}

function getAuthHeaders() {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function fetchData() {
  const res = await fetch(`${API_BASE}/data`, { headers: getAuthHeaders() });
  if (res.status === 403 || res.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login.html';
    return null;
  }
  return await res.json();
}

async function loadAdminData() {
  const data = await fetchData();
  if (!data) return;

  // Personal Information
  document.getElementById('name').value = data.personal.name || '';
  document.getElementById('title').value = data.personal.title || '';
  document.getElementById('bio').value = data.personal.bio || '';
  document.getElementById('avatar').value = data.personal.avatar || '';
  document.getElementById('email').value = data.personal.email || '';
  document.getElementById('phone').value = data.personal.phone || '';
  document.getElementById('skills').value = data.personal.skills || '';
  document.getElementById('resumeLink').value = data.personal.resumeLink || '';
  
  // Certificates - convert array to text format
  if (data.personal.certificates && Array.isArray(data.personal.certificates)) {
    document.getElementById('certificates').value = data.personal.certificates.join('\n');
  } else {
    document.getElementById('certificates').value = '';
  }
  
  document.getElementById('showAvatar').value = data.personal.showAvatar || 'yes';

  // Social Links
  document.getElementById('github').value = data.social.github || '';
  document.getElementById('linkedin').value = data.social.linkedin || '';
  document.getElementById('twitter').value = data.social.twitter || '';

  renderProjects(data.projects);
}

function renderProjects(projects) {
  const container = document.getElementById('projects-list');
  if (!container) return;
  
  container.innerHTML = '';
  projects.forEach(proj => {
    const div = document.createElement('div');
    div.className = 'project-item';
    div.innerHTML = `
      <strong>${proj.title}</strong>
      <p>${proj.description ? proj.description.substring(0, 80) : ''}...</p>
      <button class="edit-project" data-id="${proj.id}">Edit</button>
      <button class="delete-project" data-id="${proj.id}">Delete</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.edit-project').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      const project = projects.find(p => p.id === id);
      const newTitle = prompt('Edit title', project.title);
      const newDesc = prompt('Edit description', project.description);
      const newImage = prompt('Image URL', project.image);
      const newDemo = prompt('Demo link', project.demoLink);
      const newSource = prompt('Source link', project.sourceLink);
      if (newTitle) {
        await fetch(`${API_BASE}/projects/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ title: newTitle, description: newDesc, image: newImage, demoLink: newDemo, sourceLink: newSource })
        });
        loadAdminData();
      }
    });
  });

  document.querySelectorAll('.delete-project').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete project?')) {
        await fetch(`${API_BASE}/projects/${btn.dataset.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        loadAdminData();
      }
    });
  });
}

// Save Personal Information
document.getElementById('savePersonal')?.addEventListener('click', async () => {
  const certificatesText = document.getElementById('certificates').value;
  const certificates = certificatesText.split('\n').filter(line => line.trim());
  
  const payload = {
    name: document.getElementById('name').value,
    title: document.getElementById('title').value,
    bio: document.getElementById('bio').value,
    avatar: document.getElementById('avatar').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    skills: document.getElementById('skills').value,
    resumeLink: document.getElementById('resumeLink').value,
    showAvatar: document.getElementById('showAvatar').value,
    certificates: certificates
  };
  
  const response = await fetch(`${API_BASE}/personal`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    alert('Personal info updated successfully!');
    loadAdminData();
  } else {
    alert('Error saving personal info');
  }
});

// Save Social Links
document.getElementById('saveSocial')?.addEventListener('click', async () => {
  const payload = {
    github: document.getElementById('github').value,
    linkedin: document.getElementById('linkedin').value,
    twitter: document.getElementById('twitter').value
  };
  
  const response = await fetch(`${API_BASE}/social`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    alert('Social links updated successfully!');
    // Reload to confirm changes were saved
    loadAdminData();
  } else {
    alert('Error saving social links');
  }
});

// Add New Project
document.getElementById('addProject')?.addEventListener('click', async () => {
  const newProject = {
    title: document.getElementById('newTitle').value,
    description: document.getElementById('newDesc').value,
    image: document.getElementById('newImage').value,
    demoLink: document.getElementById('newDemo').value,
    sourceLink: document.getElementById('newSource').value
  };
  
  if (!newProject.title) {
    alert('Title is required');
    return;
  }
  
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newProject)
  });
  
  if (response.ok) {
    alert('Project added successfully!');
    document.getElementById('newTitle').value = '';
    document.getElementById('newDesc').value = '';
    document.getElementById('newImage').value = '';
    document.getElementById('newDemo').value = '';
    document.getElementById('newSource').value = '';
    loadAdminData();
  } else {
    alert('Error adding project');
  }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/';
});

// Load everything
loadAdminData();