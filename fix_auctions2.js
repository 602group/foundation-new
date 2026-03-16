const fs = require('fs');

async function fixAuctions() {
    const url = 'https://foundation-website-rose.vercel.app/api/auctions';
    const res = await fetch(url);
    const auctions = await res.json();
    
    for (let a of auctions) {
        if (a.id === 'pine-valley') {
            a.course_id = 'pine-valley-gc'; // Use exact ID from shared-courses.js
            a.course = 'Pine Valley Golf Club';
            a.images = [];
            console.log('Fixed Pine Valley');
            await fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(a) });
        }
    }
    console.log('Done!');
}
fixAuctions();
