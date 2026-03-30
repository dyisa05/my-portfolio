const API_URL = '/api/portfolio';

async function loadPortfolio() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Handle profile picture (show/hide)
    const avatarImg = document.getElementById('avatar-img');
    if (data.personal.showAvatar === 'no') {
      avatarImg.style.display = 'none';
    } else {
      avatarImg.style.display = 'block';
      avatarImg.src = data.personal.avatar;
    }

    // Personal info
    document.getElementById('hero-name').textContent = data.personal.name;
    document.getElementById('hero-title').textContent = data.personal.title;
    document.getElementById('about-bio').textContent = data.personal.bio;
    document.getElementById('contact-email').textContent = data.personal.email;
    document.getElementById('contact-phone').textContent = data.personal.phone;

    // Skills
    const skillsDiv = document.getElementById('skills-list');
    if (data.personal.skills) {
      const skills = data.personal.skills.split(',').map(s => s.trim());
      skillsDiv.innerHTML = skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
    } else {
      skillsDiv.innerHTML = '<p>No skills added yet</p>';
    }

    // Certificates
    const certsDiv = document.getElementById('certificates-list');
    if (data.personal.certificates) {
      const certs = data.personal.certificates.split('\n');
      certsDiv.innerHTML = certs.map(cert => {
        const parts = cert.split(' - ');
        if (parts.length > 1 && parts[1]) {
          return `<div class="certificate-item">📜 <a href="${parts[1]}" target="_blank">${parts[0]}</a></div>`;
        }
        return `<div class="certificate-item">📜 ${cert}</div>`;
      }).join('');
    } else {
      certsDiv.innerHTML = '<p>No certificates added yet</p>';
    }

    // Resume link
    const resumeDiv = document.getElementById('resume-link');
    if (data.personal.resumeLink && data.personal.resumeLink !== '') {
      resumeDiv.innerHTML = `<a href="${data.personal.resumeLink}" class="resume-btn" target="_blank">📄 Download Resume/CV</a>`;
    } else {
      resumeDiv.innerHTML = '<p>No resume uploaded yet</p>';
    }

    // Social links
    const socialDiv = document.getElementById('social-links');
    socialDiv.innerHTML = '';
    for (const [platform, url] of Object.entries(data.social)) {
      if (url) {
        socialDiv.innerHTML += `<a href="${url}" target="_blank"><i class="fab fa-${platform}"></i></a>`;
      }
    }

    // Projects
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    data.projects.forEach(proj => {
      projectsGrid.innerHTML += `
        <div class="project-card">
          <img src="${proj.image}" alt="${proj.title}">
          <h3>${proj.title}</h3>
          <p>${proj.description}</p>
          <div class="project-links">
            <a href="${proj.demoLink}" target="_blank">Live Demo</a>
            <a href="${proj.sourceLink}" target="_blank">Source Code</a>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Failed to load portfolio:', err);
  }
}

loadPortfolio();