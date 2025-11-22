module.exports = async (req, res) => {
  const handle = req.query.handle;
  if (!handle) {
    return res.status(400).json({ error: 'Handle is required' });
  }
  try {
    const response = await fetch(`https://nitter.net/${encodeURIComponent(handle)}`);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch user page' });
    }
    const html = await response.text();
    const match = html.match(/Followers\s*([0-9,.]+)\s*/);
    if (!match) {
      return res.status(404).json({ error: 'User not found' });
    }
    const followers = parseInt(match[1].replace(/,/g, ''), 10);
    return res.status(200).json({ followers });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching data' });
  }
};
