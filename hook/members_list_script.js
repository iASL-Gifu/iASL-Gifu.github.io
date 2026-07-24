const MEMBER_DATA_URL = '/component/profiles/members.csv';
const GRADE_ORDER = ['Boss', 'PD', 'D3', 'D2', 'D1', 'M2', 'M1', 'B4', 'B3', 'Research Student', 'Visitor Researcher', 'OB'];

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function goBackOrRedirect() {
    if (document.referrer) {
        window.history.back();
        return;
    }

    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMembersData();
});

async function fetchMembersData() {
    try {
        const response = await fetch(MEMBER_DATA_URL);
        if (!response.ok) {
            throw new Error('名簿データ(members.csv)の取得に失敗しました。');
        }

        const csvText = await response.text();
        const members = parseCSV(csvText);
        displayMembers(members);
    } catch (error) {
        console.error('Error:', error);

        const container = document.getElementById('member-list-container');
        const loadingMessage = document.getElementById('loading-message');

        if (container) {
            container.insertAdjacentHTML('beforeend', `<p style="text-align: center; color: #b42318;">${escapeHtml(error.message)}</p>`);
        }

        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
    }
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) {
        return [];
    }

    const headers = lines[0].split(',').map((header) => header.trim());

    return lines.slice(1).filter(Boolean).map((line) => {
        const values = line.split(',').map((value) => value.trim());
        const member = {};

        headers.forEach((header, index) => {
            member[header] = values[index] || '';
        });

        return member;
    });
}

function displayMembers(members) {
    const container = document.getElementById('member-list-container');
    if (!container) {
        return;
    }

    const groupedMembers = members.reduce((groups, member) => {
        const nextGroups = groups;
        const grade = member.grade || 'Other';

        if (!nextGroups[grade]) {
            nextGroups[grade] = [];
        }

        nextGroups[grade].push(member);
        return nextGroups;
    }, {});

    const contentHTML = GRADE_ORDER.filter((grade) => groupedMembers[grade]).map((grade) => `
        <section class="member-group${grade === 'OB' ? ' member-group--ob' : ''}">
            <h2 class="grade-title">${escapeHtml(grade)}</h2>
            <div class="${grade === 'OB' ? 'ob-list' : 'member-list'}">
                ${groupedMembers[grade].map(grade === 'OB' ? createObEntry : createMemberCard).join('')}
            </div>
        </section>
    `).join('');

    container.innerHTML = `<h1 class="page-title">Members</h1>${contentHTML}`;
}

function createMemberCard(member) {
    const githubIcon = member.githubUrl
        ? `<a href="${escapeHtml(member.githubUrl)}" target="_blank" rel="noopener noreferrer" title="GitHub"><img src="/img/github.png" alt="GitHub" class="social-icon" loading="lazy"></a>`
        : '';

    const xIcon = member.snsUrl
        ? `<a href="${escapeHtml(member.snsUrl)}" target="_blank" rel="noopener noreferrer" title="SNS"><img src="${escapeHtml(member.snsLogo)}" alt="SNS" class="social-icon" loading="lazy"></a>`
        : '';

    const keywords = member.keywords
        ? member.keywords.split(' ').filter(Boolean).map((keyword) => `<span class="keyword-tag">${escapeHtml(keyword)}</span>`).join('')
        : '';

    return `
        <article class="member-card">
            <a href="profile.html?id=${encodeURIComponent(member.id)}" class="profile-link">
                <img src="${escapeHtml(member.imageUrl)}" alt="${escapeHtml(member.name)}" class="profile-pic" loading="lazy">
            </a>
            <div class="member-info">
                <h3 class="member-name">
                    <a href="profile.html?id=${encodeURIComponent(member.id)}" class="profile-link">${escapeHtml(member.name)}</a>
                </h3>
                <div class="keywords-container">${keywords}</div>
                <div class="social-icons">
                    ${githubIcon}
                    ${xIcon}
                </div>
            </div>
        </article>
    `;
}

function createObEntry(member) {
    return `<div class="ob-name">${escapeHtml(member.name)}</div>`;
}
