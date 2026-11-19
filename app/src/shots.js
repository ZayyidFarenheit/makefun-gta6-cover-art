// Fixed scenes for screenshots: ?shot=editor shows the page with the sample
// photos loaded; ?shot=cover shows the cover alone at the requested size and
// layout. window.__shotReady is set once painted, so a screenshot runner
// knows the scene is ready.
export async function runShot(shot, query, state, photos, redraw) {
  const size = (query.get('size') || '1920x1080').split('x').map(Number);
  const layout = query.get('layout');
  const grade = query.get('grade');
  const poster = query.get('poster');
  if (layout) state.layout = layout;
  if (grade) state.grade = grade;
  if (poster === 'off') state.posterInk = false;
  if (poster === 'on') state.posterInk = true;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const canvas = document.getElementById('cover');
    canvas.width = size[0] || 1920;
    canvas.height = size[1] || 1080;
    const { drawCover } = await import('./cover.js');
    drawCover(canvas, state, photos);
  } else {
    redraw();
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
