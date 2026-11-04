async (page) => {
  await page.goto('http://localhost:3051/?themes=1#/3');
  const picker = page.getByLabel('Presentation theme');
  await picker.waitFor({ timeout: 15000 });
  if (await picker.locator('option').count() !== 21)
    throw new Error('Expected original style plus 20 theme options');
  const themes = await picker.locator('option').evaluateAll(options => options.map(option => option.value));
  const backgrounds = new Set();
  for (const theme of themes) {
    await picker.selectOption(theme);
    const applied = await page.evaluate(() => document.documentElement.dataset.talkTheme || 'original');
    if (applied !== theme) throw new Error(`Theme did not apply: ${theme}`);
    backgrounds.add(await page.locator('.slidev-page-3 .slidev-layout').evaluate(element => getComputedStyle(element).backgroundColor));
    if (!page.url().endsWith('#/3')) throw new Error('Theme switch changed the current slide');
  }
  if (backgrounds.size !== 21) throw new Error('Theme options did not produce distinct slide backgrounds');
  await picker.selectOption('workshop');
  await page.reload();
  if (await picker.inputValue() !== 'workshop') throw new Error('Theme was not restored');
  await page.locator('body').click({ position: { x: 20, y: 200 } });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => location.hash.includes('clicks=1'));
  await picker.selectOption('terminal');
  if (!page.url().includes('clicks=1')) throw new Error('Theme switch reset the animation step');
  await page.getByRole('button', { name: 'Replay slide' }).click();
  await page.waitForFunction(() => !location.hash.includes('clicks=1'));
  await page.getByRole('button', { name: 'Animation lab' }).click();
  await page.getByRole('heading', { name: 'Animation lab · reveal and annotate' }).waitFor();
  await page.locator('body').click({ position: { x: 20, y: 200 } });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('.slidev-page-34 .rough-annotation'));
  await page.goto('http://localhost:3051/?themes=1&theme=workshop#/35');
  await page.locator('.slidev-page-35 .slidev-code-magic-move').waitFor();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('.slidev-page-35 .slidev-code-magic-move')?.textContent.includes('wg.Wait()'));
  if (!await page.locator('.slidev-page-35 .highlighted').count()) throw new Error('Missing code highlights');
  await page.goto('http://localhost:3051/?themes=1&theme=workshop#/36');
  await page.locator('.slidev-page-36 .pool-diagram').waitFor();
  const stageOpacity = () => page.locator('.slidev-page-36 .pool-diagram > g').evaluateAll(groups => groups.map(g => g.style.opacity));
  const before = await stageOpacity();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => location.hash.includes('clicks=1'));
  if (JSON.stringify(before) === JSON.stringify(await stageOpacity())) throw new Error('Diagram stage did not change');
  await page.goto('http://localhost:3051/?themes=1&theme=workshop#/37');
  await page.locator('.checkpoint-token').waitFor();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.checkpoint-token')).transform === 'matrix(1, 0, 0, 1, 360, 0)');
  await picker.selectOption('terminal');
  await page.keyboard.press('Tab');
  await page.locator('body').click({ position: { x: 20, y: 200 } });
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.checkpoint-token')).transform === 'matrix(1, 0, 0, 1, 720, 0)');
  await page.goto('http://localhost:3051/#/1');
  if (await page.getByLabel('Presentation theme').count()) throw new Error('Preview controls leaked into the normal presentation');
  return { themes: themes.length, persisted: true, slideAndClickPreserved: true, replay: true, animationLab: ['annotations', 'magic-move', 'line highlights', 'staged diagram', 'moving checkpoint'], normalPresentationUnchanged: true };
}
