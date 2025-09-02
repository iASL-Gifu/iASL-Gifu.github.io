// CSVファイルのパスを指定
const MEMBER_DATA_URL = '/component/profiles/members.csv';

// 学年の表示順を定義
const GRADE_ORDER = ['Boss', 'PD', 'D3', 'D2', 'D1', 'M2', 'M1', 'B4', 'B3'];

// 戻るボタンの関数
function goBackOrRedirect() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = "/index.html";
    }
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
        container.innerHTML += `<p style="text-align: center; color: red;">${error.message}</p>`;
        document.getElementById('loading-message').style.display = 'none';
    }
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const members = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = lines[i].split(',').map(v => v.trim());
        const member = {};
        headers.forEach((header, index) => {
            member[header] = values[index];
        });
        members.push(member);
    }
    return members;
}

function displayMembers(members) {
    const container = document.getElementById('member-list-container');
    const groupedMembers = {};
    members.forEach(member => {
        if (!groupedMembers[member.grade]) {
            groupedMembers[member.grade] = [];
        }
        groupedMembers[member.grade].push(member);
    });
    let contentHTML = '<h1 class="page-title">Members</h1>';
    GRADE_ORDER.forEach(grade => {
        if (groupedMembers[grade]) {
            contentHTML += `
                <div class="member-group">
                    <h2 class="grade-title">${grade}</h2>
                    <div class="member-list">
                        ${groupedMembers[grade].map(member => createMemberCard(member)).join('')}
                    </div>
                </div>`;
        }
    });
    container.innerHTML = contentHTML;
}

function createMemberCard(member) {
    const githubIcon = member.githubUrl ? `<a href="${member.githubUrl}" target="_blank" rel="noopener noreferrer" title="GitHub"><img src="/img/github.png" alt="GitHub" class="social-icon"></a>` : '';
    const xIcon = member.xUrl ? `<a href="${member.xUrl}" target="_blank" rel="noopener noreferrer" title="X"><img src="/img/x-logo.png" alt="X" class="social-icon"></a>` : '';
    return `
        <div class="member-card">
            <a href="profile.html?id=${member.id}" class="profile-link">
                <img src="${member.imageUrl}" alt="${member.name}" class="profile-pic">
            </a>
            <div class="member-info">
                <h3 class="member-name">
                    <a href="profile.html?id=${member.id}" class="profile-link">${member.name}</a>
                </h3>
                <div class="social-icons">
                    ${githubIcon}
                    ${xIcon}
                </div>
            </div>
        </div>`;
}