import { promises as fs } from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'seo.json');

async function loadFile(name) {
  try {
    const filePath = path.join(process.cwd(), 'data', name);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch { return []; }
}

async function ensureDataFile() {
  try {
    await fs.access(dataPath);
  } catch (e) {
    const defaultSEO = [
      { id: 'home', category: 'Main Pages', page: 'Home', route: '/', title: 'SeenHub | Premium Business Hub in Al Ain', description: 'Experience the first AI-powered business hub in Al Ain. Premium workspaces, meeting rooms, and networking events.' },
      { id: 'booking', category: 'Main Pages', page: 'Booking', route: '/workspaces', title: 'Book Your Workspace | SeenHub Business Suite', description: 'Reserve premium meeting rooms, private offices, and coworking spaces online.' },
      { id: 'memberships', category: 'Main Pages', page: 'Memberships', route: '/memberships', title: 'Membership Plans | SeenHub Business Suite', description: 'Flexible membership plans designed for entrepreneurs and businesses of all sizes.' },
      { id: 'events', category: 'Main Pages', page: 'Events', route: '/events', title: 'Business Events & Workshops | SeenHub', description: 'Join industry-leading workshops and networking events at SeenHub Business Hub.' },
      { id: 'blogs', category: 'Main Pages', page: 'Blogs', route: '/blogs', title: 'Insights & News | SeenHub Blog', description: 'Read the latest trends in business, AI, and entrepreneurship from SeenHub experts.' },
      { id: 'contact', category: 'Main Pages', page: 'Contact', route: '/contact', title: 'Contact Us | SeenHub Business Suite', description: 'Get in touch with our team for inquiries, bookings, or support.' }
    ];
    await fs.writeFile(dataPath, JSON.stringify(defaultSEO, null, 2));
  }
}

export async function GET() {
  await ensureDataFile();
  const rawSeo = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  
  const workspaces = await loadFile('workspaces.json');
  const memberships = await loadFile('memberships.json');
  const events = await loadFile('events.json');
  const blogs = await loadFile('blogs.json');

  // Build a consolidated list and ensure categories exist for old items
  const consolidated = rawSeo.map(item => ({
    ...item,
    category: item.category || 'Main Pages' // Fix for existing items without category
  }));

  const sync = (items, category, idPrefix, routePrefix) => {
    items.forEach(item => {
      const id = `${idPrefix}-${item.id}`;
      if (!consolidated.find(s => s.id === id)) {
        consolidated.push({
          id,
          category,
          page: item.title || item.name || 'Untitled',
          route: `${routePrefix}/${item.id}`,
          title: '',
          description: ''
        });
      }
    });
  };

  sync(workspaces, 'Workspaces', 'ws', '/workspaces');
  sync(memberships, 'Memberships', 'mem', '/memberships'); // Membership usually shared page or individual? Assuming shared or individual sub-routes.
  sync(events, 'Events', 'evt', '/events');
  sync(blogs, 'Blogs', 'blog', '/blogs');

  return new Response(JSON.stringify(consolidated), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req) {
  try {
    const body = await req.json();
    await fs.writeFile(dataPath, JSON.stringify(body, null, 2));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save SEO settings' }), { status: 500 });
  }
}
