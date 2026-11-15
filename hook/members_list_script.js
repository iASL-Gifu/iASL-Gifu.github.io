const MEMBER_DATA_URL = '/component/profiles/members.csv';
const GRADE_ORDER = ['Boss', 'PD', 'DC', 'M2', 'M1', 'B4', 'B3', 'Research Student', 'Visitor Researcher', 'OB'];

function isSafeHttpUrl(urlValue) {
    const trimmed = String(urlValue || '').trim();
    if (!trimmed) {
        return false;
    }
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
}

function isSafeImagePath(pathValue) {
    const trimmed = String(pathValue || '').trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.includes('..') || trimmed.includes('\\')) {
        return false;
    }
    if (trimmed.startsWith('/img/') || trimmed.startsWith('img/')) {
        return true;
    }
    return isSafeHttpUrl(trimmed);
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
        console.error('Error:', error.message || error);

        const container = document.getElementById('member-list-container');
        const loadingMessage = document.getElementById('loading-message');

        if (container) {
            const errorP = document.createElement('p');
            errorP.style.textAlign = 'center';
            errorP.style.color = '#b42318';
            errorP.textContent = error.message;
            container.appendChild(errorP);
        }

        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
    }
}

function splitCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) {
        return [];
    }

    const headers = splitCsvLine(lines[0]);

    return lines.slice(1).filter(Boolean).map((line) => {
        const values = splitCsvLine(line);
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

    const fragment = document.createDocumentFragment();
    const titleEl = document.createElement('h1');
    titleEl.className = 'page-title';
    titleEl.textContent = 'Members';
    fragment.appendChild(titleEl);

    GRADE_ORDER.filter((grade) => groupedMembers[grade]).forEach((grade) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = `member-group${grade === 'OB' ? ' member-group--ob' : ''}`;

        const headingEl = document.createElement('h2');
        headingEl.className = 'grade-title';
        headingEl.textContent = grade;
        sectionEl.appendChild(headingEl);

        const listEl = document.createElement('div');
        listEl.className = grade === 'OB' ? 'ob-list' : 'member-list';

        groupedMembers[grade].forEach((member) => {
            const memberNode = grade === 'OB' ? createObEntry(member) : createMemberCard(member);
            listEl.appendChild(memberNode);
        });

        sectionEl.appendChild(listEl);
        fragment.appendChild(sectionEl);
    });

    container.replaceChildren(fragment);
}

function createMemberCard(member) {
    const articleEl = document.createElement('article');
    articleEl.className = 'member-card';

    const profileHref = `profile.html?id=${encodeURIComponent(member.id || '')}`;

    const imageLink = document.createElement('a');
    imageLink.href = profileHref;
    imageLink.className = 'profile-link';

    const profileImg = document.createElement('img');
    profileImg.src = isSafeImagePath(member.imageUrl) ? member.imageUrl.trim() : '/img/logo_clear.png';
    profileImg.alt = member.name || '';
    profileImg.className = 'profile-pic';
    profileImg.loading = 'lazy';
    imageLink.appendChild(profileImg);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'member-info';

    const nameH3 = document.createElement('h3');
    nameH3.className = 'member-name';

    const nameLink = document.createElement('a');
    nameLink.href = profileHref;
    nameLink.className = 'profile-link';
    nameLink.setAttribute('translate', 'no');
    nameLink.textContent = member.name || '';
    nameH3.appendChild(nameLink);

    const keywordsContainer = document.createElement('div');
    keywordsContainer.className = 'keywords-container';
    if (member.keywords) {
        member.keywords.split(' ').filter(Boolean).forEach((keyword) => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'keyword-tag';
            tagSpan.textContent = keyword;
            keywordsContainer.appendChild(tagSpan);
        });
    }

    const socialIconsDiv = document.createElement('div');
    socialIconsDiv.className = 'social-icons';

    if (member.githubUrl && isSafeHttpUrl(member.githubUrl)) {
        const ghLink = document.createElement('a');
        ghLink.href = member.githubUrl.trim();
        ghLink.target = '_blank';
        ghLink.rel = 'noopener noreferrer';
        ghLink.title = 'GitHub';

        const ghImg = document.createElement('img');
        ghImg.src = '/img/site_assets/github.png';
        ghImg.alt = 'GitHub';
        ghImg.className = 'social-icon';
        ghImg.loading = 'lazy';
        ghLink.appendChild(ghImg);
        socialIconsDiv.appendChild(ghLink);
    }

    if (member.snsUrl && isSafeHttpUrl(member.snsUrl) && isSafeImagePath(member.snsLogo)) {
        const snsLink = document.createElement('a');
        snsLink.href = member.snsUrl.trim();
        snsLink.target = '_blank';
        snsLink.rel = 'noopener noreferrer';
        snsLink.title = 'SNS';

        const snsImg = document.createElement('img');
        snsImg.src = member.snsLogo.trim();
        snsImg.alt = 'SNS';
        snsImg.className = 'social-icon';
        snsImg.loading = 'lazy';
        snsLink.appendChild(snsImg);
        socialIconsDiv.appendChild(snsLink);
    }

    infoDiv.appendChild(nameH3);
    infoDiv.appendChild(keywordsContainer);
    infoDiv.appendChild(socialIconsDiv);

    articleEl.appendChild(imageLink);
    articleEl.appendChild(infoDiv);
    return articleEl;
}

function createObEntry(member) {
    const obDiv = document.createElement('div');
    obDiv.className = 'ob-name';
    obDiv.setAttribute('translate', 'no');
    obDiv.textContent = member.name || '';
    return obDiv;
}
