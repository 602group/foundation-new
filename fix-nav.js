const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));

const standardNav = `        <nav class="nav-links">
            <a href="dashboard.html" class="nav-item"><span class="nav-icon">📊</span> Dashboard</a>
            <a href="auctions.html" class="nav-item"><span class="nav-icon">⛳</span> Auctions</a>
            <a href="users.html" class="nav-item"><span class="nav-icon">👥</span> Users</a>
            <a href="bids.html" class="nav-item"><span class="nav-icon">💰</span> Bids</a>
            <a href="events.html" class="nav-item"><span class="nav-icon">✈️</span> Events &amp; Trips</a>
            <a href="messages.html" class="nav-item"><span class="nav-icon">💬</span> Messages</a>
            <a href="tasks.html" class="nav-item"><span class="nav-icon">✅</span> Tasks</a>
            <a href="financials.html" class="nav-item"><span class="nav-icon">📈</span> Financials</a>
            <a href="#" class="nav-item"><span class="nav-icon">⚙️</span> Settings</a>
        </nav>`;

files.forEach(file => {
    const filePath = path.join(adminDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match the nav-links block, including all inner contents and newlines
    const regex = /<nav class="nav-links">[\s\S]*?<\/nav>/;

    // Check if file has the nav block
    if (regex.test(content)) {
        // Inject the standard one
        content = content.replace(regex, standardNav);

        // Find which page this is and add the 'active' class to its specific item
        const pageName = file;
        const activeItemRegex = new RegExp(`(<a href="${pageName}" class="nav-item)(">.*?</a>)`);

        // We do a hack for dashboard.html where the href was sometimes "#"
        if (pageName === 'dashboard.html') {
            content = content.replace(
                /<a href="dashboard\.html" class="nav-item">/,
                '<a href="dashboard.html" class="nav-item active">'
            );
        } else {
            content = content.replace(activeItemRegex, '$1 active$2');
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated navigation in ${file}`);
    }
});
