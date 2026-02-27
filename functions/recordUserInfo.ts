import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { username, old_username } = body;

    // Get IP from headers
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Attempt geo lookup
    let geo = null;
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,lat,lon,isp`);
      if (geoRes.ok) geo = await geoRes.json();
    } catch (_) {}

    // Find or create profile detail record
    const existing = await base44.asServiceRole.entities.UserProfileDetail.filter({ user_email: user.email });
    const now = new Date().toISOString();

    if (existing.length > 0) {
      const rec = existing[0];
      const pastUsernames = rec.past_usernames || [];
      if (old_username && !pastUsernames.includes(old_username)) {
        pastUsernames.push(old_username);
      }
      const ips = rec.ip_addresses || [];
      if (!ips.includes(ip)) ips.push(ip);
      const geos = rec.geo_locations || [];
      if (geo) geos.push({ ...geo, recorded_at: now });
      const agents = rec.user_agents || [];
      if (!agents.includes(userAgent)) agents.push(userAgent);

      await base44.asServiceRole.entities.UserProfileDetail.update(rec.id, {
        current_username: username,
        past_usernames: pastUsernames,
        ip_addresses: ips,
        geo_locations: geos,
        user_agents: agents,
        last_ip: ip,
        last_geo: geo,
      });
    } else {
      await base44.asServiceRole.entities.UserProfileDetail.create({
        user_email: user.email,
        current_username: username,
        past_usernames: old_username ? [old_username] : [],
        ip_addresses: [ip],
        geo_locations: geo ? [{ ...geo, recorded_at: now }] : [],
        user_agents: [userAgent],
        last_ip: ip,
        last_geo: geo,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});